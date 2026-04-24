/**
 * Grading service — orchestrates Judge0 execution across all test cases
 * for a problem and persists the result to Supabase.
 *
 * This module is server-only.  It is called by the /api/grade route handler
 * and (optionally) the gradeSubmission Server Action.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { submitCode, pollResult, mapVerdict } from "@/services/judge0";
import type { Problem, TestCase } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GradeRequest = {
  userId: string;
  problemId: number;
  code: string;
  languageId: number;
};

export type GradeResult = {
  status: string;
  score: number;
  passed: number;
  total: number;
  results: ("pass" | "fail")[];
  message?: string;
};

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export async function gradeSubmission(req: GradeRequest): Promise<GradeResult> {
  const admin = createAdminClient();

  const [
    { data: problem, error: problemError },
    { data: testCases, error: testCaseError },
  ] = await Promise.all([
    admin
      .from("problems")
      .select("id, points, time_limit, memory_limit")
      .eq("id", req.problemId)
      .single<Pick<Problem, "id" | "points" | "time_limit" | "memory_limit">>(),
    admin
      .from("test_cases")
      .select("id, input, expected_output")
      .eq("problem_id", req.problemId)
      .order("id", { ascending: true })
      .returns<Pick<TestCase, "id" | "input" | "expected_output">[]>(),
  ]);

  if (problemError || !problem) {
    throw Object.assign(new Error("Problem not found"), { code: "NOT_FOUND" });
  }
  if (testCaseError || !testCases || testCases.length === 0) {
    throw Object.assign(new Error("No test cases configured"), { code: "NO_TEST_CASES" });
  }

  let passed         = 0;
  let finalVerdict   = "AC";
  let maxTimeMs      = 0;
  let maxMemoryKb    = 0;
  let firstFailureMsg = "";
  
  // ✅ 1. เพิ่มตัวแปรเก็บผลรายข้อสำหรับส่งให้ Frontend
  const resultsDetail: ("pass" | "fail")[] = [];

  for (const tc of testCases) {
    const token = await submitCode({
      source_code:    req.code,
      language_id:    req.languageId,
      stdin:          tc.input,
      cpu_time_limit: problem.time_limit,
      memory_limit:   problem.memory_limit * 1024,
    });

    const result = await pollResult(token);
    
    maxTimeMs   = Math.max(maxTimeMs,   Number(result.time   ?? 0));
    maxMemoryKb = Math.max(maxMemoryKb, Number(result.memory ?? 0));
    
    const tcVerdict = mapVerdict(result);

    // กรณีที่ Judge0 พ่น Error (TLE, RE, CE)
    if (tcVerdict !== "AC") {
      if (finalVerdict === "AC") { 
        finalVerdict = tcVerdict;
        firstFailureMsg = result.compile_output ?? result.stderr ?? result.status.description;
      }
      resultsDetail.push("fail"); // ✅ บันทึกว่าข้อนี้ไม่ผ่าน
      continue;
    }

    // stdout is already decoded to plain text by pollResult() in judge0.ts.
    const cleanActual   = (result.stdout ?? "").replace(/\r\n/g, "\n").trim();
    const cleanExpected = tc.expected_output.replace(/\r\n/g, "\n").trim();

    if (cleanActual === cleanExpected) {
      passed++;
      resultsDetail.push("pass"); // ✅ บันทึกว่าข้อนี้ผ่านจริง
    } else {
      if (finalVerdict === "AC") {
        finalVerdict = "WA";
      }
      resultsDetail.push("fail"); // ✅ บันทึกว่าข้อนี้คำตอบผิด
    }
  }

  const total = testCases.length;
  const score = Math.round((problem.points * passed) / total);

  // บันทึกลง DB (เหมือนเดิม)
  await admin.from("submissions").insert({
    user_id:        req.userId,
    problem_id:     req.problemId,
    code:           req.code,
    language_id:    req.languageId,
    status:         finalVerdict,
    score,
    passed_count:   passed,
    total_count:    total,
    execution_time: maxTimeMs   || null,
    memory:         maxMemoryKb || null,
  });

  // ✅ 2. ส่ง results กลับไปให้ Frontend ด้วย
  return {
    status:  finalVerdict,
    score,
    passed,
    total,
    results: resultsDetail, // <--- ตัวนี้สำคัญมาก!
    message: firstFailureMsg || undefined,
  };
}

/**
 * Record an offline/failed submission without running any test cases.
 * Called when Judge0 is unreachable so the attempt is still logged.
 */
export async function recordOfflineSubmission(
  req: GradeRequest,
  totalCount: number
) {
  const admin = createAdminClient();
  await admin.from("submissions").insert({
    user_id:        req.userId,
    problem_id:     req.problemId,
    code:           req.code,
    language_id:    req.languageId,
    status:         "JUDGE0_OFFLINE",
    score:          0,
    passed_count:   0,
    total_count:    totalCount,
    execution_time: null,
    memory:         null,
  });
}
