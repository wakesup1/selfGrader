/**
 * Grading service — orchestrates cafe-grader execution for a problem and
 * persists the result to Supabase.
 *
 * Flow:
 *   1. Fetch problem + test-case count from Supabase
 *   2. If cafe_grader_problem_id is missing, sync the problem lazily
 *   3. Submit code to cafe-grader via HTTP
 *   4. Poll until the submission reaches a terminal status
 *   5. Map evaluations to NoGrader verdict/results/times
 *   6. Persist submission row; return GradeResult
 *
 * Server-side only.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { submitCode, pollResult, mapVerdict, buildResultArrays } from "@/services/cafeGrader";
import { syncProblemToCafeGrader } from "@/services/cafeGraderSync";
import type { Problem, TestCase } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GradeRequest = {
  userId:     string;
  problemId:  number;
  code:       string;
  languageId: number;
};

export type GradeResult = {
  status:   string;
  score:    number;
  passed:   number;
  total:    number;
  results:  ("pass" | "fail")[];
  /** Execution time in seconds per test case (null if CE/no execution). */
  times:    (number | null)[];
  message?: string;
};

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export async function gradeSubmission(req: GradeRequest): Promise<GradeResult> {
  const admin = createAdminClient();

  // -------------------------------------------------------------------------
  // 1. Fetch problem and test-case count in parallel
  // -------------------------------------------------------------------------
  const [
    { data: problem, error: problemError },
    { count: tcCount },
  ] = await Promise.all([
    admin
      .from("problems")
      .select("id, title, slug, points, time_limit, memory_limit, cafe_grader_problem_id")
      .eq("id", req.problemId)
      .single<
        Pick<Problem, "id" | "title" | "slug" | "points" | "time_limit" | "memory_limit" | "cafe_grader_problem_id">
      >(),
    admin
      .from("test_cases")
      .select("id", { count: "exact", head: true })
      .eq("problem_id", req.problemId),
  ]);

  if (problemError || !problem) {
    throw Object.assign(new Error("Problem not found"), { code: "NOT_FOUND" });
  }
  if (!tcCount || tcCount === 0) {
    throw Object.assign(new Error("No test cases configured"), { code: "NO_TEST_CASES" });
  }

  // -------------------------------------------------------------------------
  // 2. Lazy sync — if the problem hasn't been pushed to cafe-grader yet
  // -------------------------------------------------------------------------
  let cafeGraderProblemId = problem.cafe_grader_problem_id;

  if (!cafeGraderProblemId) {
    const { data: testCases } = await admin
      .from("test_cases")
      .select("input, expected_output")
      .eq("problem_id", req.problemId)
      .order("id", { ascending: true })
      .returns<Pick<TestCase, "input" | "expected_output">[]>();

    cafeGraderProblemId = await syncProblemToCafeGrader({
      supabaseProblemId:            problem.id,
      existingCafeGraderProblemId:  null,
      slug:        problem.slug,
      title:       problem.title,
      timeLimit:   problem.time_limit,
      memoryLimit: problem.memory_limit,
      testCases:   testCases ?? [],
    });
  }

  // -------------------------------------------------------------------------
  // 3. Submit to cafe-grader
  // -------------------------------------------------------------------------
  const cafeSubmissionId = await submitCode(cafeGraderProblemId, req.code, req.languageId);

  // -------------------------------------------------------------------------
  // 4. Poll until done
  // -------------------------------------------------------------------------
  const cafeSubmission = await pollResult(cafeSubmissionId);

  // -------------------------------------------------------------------------
  // 5. Map verdict + build per-TC arrays
  // -------------------------------------------------------------------------
  const finalVerdict = mapVerdict(cafeSubmission);

  let results:    ("pass" | "fail")[] = [];
  let times:      (number | null)[]   = [];
  let maxTimeSec  = 0;
  let maxMemoryKb = 0;
  let message:    string | undefined;

  if (finalVerdict === "CE") {
    // Compilation error — no evaluations; pad results with "fail"
    results = Array(tcCount).fill("fail");
    times   = Array(tcCount).fill(null);
    message = cafeSubmission.compiler_message ?? undefined;
  } else if (finalVerdict === "ERR") {
    results = Array(tcCount).fill("fail");
    times   = Array(tcCount).fill(null);
    message = cafeSubmission.grader_comment ?? undefined;
  } else {
    ({ results, times, maxTimeSec, maxMemoryKb } = buildResultArrays(cafeSubmission));
    // If cafe-grader reported grader_error but evaluations exist, the grading
    // actually succeeded — suppress the internal error comment from the UI.
    message = cafeSubmission.status === "grader_error"
      ? undefined
      : (cafeSubmission.grader_comment ?? undefined);
  }

  const passed = results.filter((r) => r === "pass").length;
  const total  = tcCount;
  const score  = Math.round((problem.points * passed) / total);

  // -------------------------------------------------------------------------
  // 6. Persist to Supabase
  // -------------------------------------------------------------------------
  await admin.from("submissions").insert({
    user_id:        req.userId,
    problem_id:     req.problemId,
    code:           req.code,
    language_id:    req.languageId,
    status:         finalVerdict,
    score,
    passed_count:   passed,
    total_count:    total,
    execution_time: maxTimeSec  || null,
    memory:         Math.round(maxMemoryKb) || null,
  });

  return { status: finalVerdict, score, passed, total, results, times, message };
}

// ---------------------------------------------------------------------------
// Offline fallback — called when cafe-grader is unreachable
// ---------------------------------------------------------------------------

export async function recordOfflineSubmission(
  req: GradeRequest,
  totalCount: number
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("submissions").insert({
    user_id:        req.userId,
    problem_id:     req.problemId,
    code:           req.code,
    language_id:    req.languageId,
    status:         "GRADER_OFFLINE",
    score:          0,
    passed_count:   0,
    total_count:    totalCount,
    execution_time: null,
    memory:         null,
  });
}
