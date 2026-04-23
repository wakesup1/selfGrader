import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeOutput } from "@/lib/utils";
import type { Problem, TestCase } from "@/lib/types";

const requestSchema = z.object({
  problemId: z.number().int().positive(),
  code: z.string().min(1),
  languageId: z.number().int(),
});

type Judge0SubmitResponse = {
  token: string;
};

type Judge0Result = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
};

const PROCESSING_STATUS_IDS = new Set([1, 2]);
const MAX_POLLS = 25;
const POLL_DELAY_MS = 1000;

export const runtime = "nodejs";

function mapJudge0Status(statusDescription: string): string {
  const status = statusDescription.toLowerCase();

  if (status.includes("accepted")) return "AC";
  if (status.includes("wrong answer")) return "WA";
  if (status.includes("time limit")) return "TLE";
  if (status.includes("compilation error")) return "CE";
  if (status.includes("runtime") || status.includes("segmentation")) return "RE";

  return "ERR";
}

function getJudge0Headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(process.env.JUDGE0_API_KEY ? { "X-RapidAPI-Key": process.env.JUDGE0_API_KEY } : {}),
    ...(process.env.JUDGE0_API_HOST ? { "X-RapidAPI-Host": process.env.JUDGE0_API_HOST } : {}),
  };
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function submitToJudge0(payload: {
  source_code: string;
  language_id: number;
  stdin: string;
  cpu_time_limit: number;
  memory_limit: number;
}): Promise<Judge0SubmitResponse> {
  const baseUrl = process.env.JUDGE0_URL;
  if (!baseUrl) {
    throw new Error("JUDGE0_URL is required");
  }

  const response = await fetch(`${baseUrl}/submissions?base64_encoded=false`, {
    method: "POST",
    headers: getJudge0Headers(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Judge0 submission failed: ${response.status}`);
  }

  return (await response.json()) as Judge0SubmitResponse;
}

async function pollJudge0Result(token: string): Promise<Judge0Result> {
  const baseUrl = process.env.JUDGE0_URL;
  if (!baseUrl) {
    throw new Error("JUDGE0_URL is required");
  }

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const response = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=false`, {
      headers: getJudge0Headers(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Judge0 polling failed: ${response.status}`);
    }

    const result = (await response.json()) as Judge0Result;

    if (!PROCESSING_STATUS_IDS.has(result.status.id)) {
      return result;
    }

    await sleep(POLL_DELAY_MS);
  }

  throw new Error("Judge0 polling timeout");
}

async function insertSubmission(admin: ReturnType<typeof createAdminClient>, payload: {
  userId: string;
  problemId: number;
  code: string;
  languageId: number;
  status: string;
  score: number;
  passedCount: number;
  totalCount: number;
  executionTime: number | null;
  memory: number | null;
}) {
  await admin.from("submissions").insert({
    user_id: payload.userId,
    problem_id: payload.problemId,
    code: payload.code,
    language_id: payload.languageId,
    status: payload.status,
    score: payload.score,
    passed_count: payload.passedCount,
    total_count: payload.totalCount,
    execution_time: payload.executionTime,
    memory: payload.memory,
  });
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: problem, error: problemError } = await admin
      .from("problems")
      .select("id, points, time_limit, memory_limit")
      .eq("id", body.problemId)
      .single<Pick<Problem, "id" | "points" | "time_limit" | "memory_limit">>();

    if (problemError || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { data: testCases, error: testCaseError } = await admin
      .from("test_cases")
      .select("id, input, expected_output")
      .eq("problem_id", body.problemId)
      .order("id", { ascending: true })
      .returns<Pick<TestCase, "id" | "input" | "expected_output">[]>();

    if (testCaseError || !testCases || testCases.length === 0) {
      return NextResponse.json({ error: "No test cases configured for this problem" }, { status: 400 });
    }

    let passed = 0;
    let submissionStatus = "AC";
    let maxTime = 0;
    let maxMemory = 0;
    let failureMessage = "";

    try {
      for (const testCase of testCases) {
        const submitted = await submitToJudge0({
          source_code: body.code,
          language_id: body.languageId,
          stdin: testCase.input,
          cpu_time_limit: problem.time_limit,
          memory_limit: problem.memory_limit * 1024,
        });

        const judgeResult = await pollJudge0Result(submitted.token);

        maxTime = Math.max(maxTime, Number(judgeResult.time ?? 0));
        maxMemory = Math.max(maxMemory, Number(judgeResult.memory ?? 0));

        const mapped = mapJudge0Status(judgeResult.status.description);
        if (mapped !== "AC") {
          submissionStatus = mapped;
          failureMessage = judgeResult.compile_output ?? judgeResult.stderr ?? judgeResult.status.description;
          break;
        }

        const actual = normalizeOutput(judgeResult.stdout);
        const expected = normalizeOutput(testCase.expected_output);

        if (actual === expected) {
          passed += 1;
        } else {
          submissionStatus = "WA";
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Judge0 unavailable";

      await insertSubmission(admin, {
        userId: user.id,
        problemId: body.problemId,
        code: body.code,
        languageId: body.languageId,
        status: "JUDGE0_OFFLINE",
        score: 0,
        passedCount: 0,
        totalCount: testCases.length,
        executionTime: null,
        memory: null,
      });

      return NextResponse.json(
        {
          error: "Judge0 server is offline or unreachable",
          details: message,
        },
        { status: 503 },
      );
    }

    const total = testCases.length;
    const score = Math.round((problem.points * passed) / total);

    await insertSubmission(admin, {
      userId: user.id,
      problemId: body.problemId,
      code: body.code,
      languageId: body.languageId,
      status: submissionStatus,
      score,
      passedCount: passed,
      totalCount: total,
      executionTime: maxTime || null,
      memory: maxMemory || null,
    });

    return NextResponse.json({
      status: submissionStatus,
      score,
      passed,
      total,
      message: failureMessage || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
  }
}
