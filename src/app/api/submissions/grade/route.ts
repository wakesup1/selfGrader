import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runJudge0, mapJudge0Status } from "@/lib/judge0";
import { normalizeOutput } from "@/lib/utils";
import type { Problem, TestCase } from "@/lib/types";

const requestSchema = z.object({
  problemId: z.number().int().positive(),
  code: z.string().min(1),
  languageId: z.number().int(),
});

export const runtime = "nodejs";

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

    for (const testCase of testCases) {
      const judgeResult = await runJudge0({
        source_code: body.code,
        language_id: body.languageId,
        stdin: testCase.input,
        cpu_time_limit: problem.time_limit,
        memory_limit: problem.memory_limit * 1024,
      });

      maxTime = Math.max(maxTime, Number(judgeResult.time ?? 0));
      maxMemory = Math.max(maxMemory, Number(judgeResult.memory ?? 0));

      const mappedStatus = mapJudge0Status(judgeResult.status.description);
      if (mappedStatus !== "AC") {
        submissionStatus = mappedStatus;
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

    const total = testCases.length;
    const score = Math.round((problem.points * passed) / total);

    await admin.from("submissions").insert({
      user_id: user.id,
      problem_id: body.problemId,
      code: body.code,
      language_id: body.languageId,
      status: submissionStatus,
      score,
      passed_count: passed,
      total_count: total,
      execution_time: maxTime || null,
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
