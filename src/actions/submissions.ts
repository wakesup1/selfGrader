"use server";

import { createClient } from "@/lib/supabase/server";
import { gradeSubmission, recordOfflineSubmission } from "@/services/grading";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GradeResult } from "@/services/grading";

/**
 * Server Action version of gradeSubmission.
 *
 * Use this from Client Components via `useFormState` / `useTransition` when
 * you prefer the Server Action model over the fetch-to-API-route model.
 * The /api/grade route handler uses the same grading service underneath.
 */
export async function gradeCode(
  problemId: number,
  code: string,
  languageId: number
): Promise<GradeResult & { error?: string; httpStatus?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", httpStatus: 401, status: "", score: 0, passed: 0, total: 0, results: [], times: [] };
  }

  // Look up total test-case count for the offline-submission fallback.
  const admin = createAdminClient();
  const { count } = await admin
    .from("test_cases")
    .select("id", { count: "exact", head: true })
    .eq("problem_id", problemId);

  try {
    const result = await gradeSubmission({ userId: user.id, problemId, code, languageId });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Grader unavailable";
    const isNotFound   = (err as { code?: string }).code === "NOT_FOUND";
    const isNoTestCase = (err as { code?: string }).code === "NO_TEST_CASES";

    if (isNotFound)   return { error: "Problem not found",         httpStatus: 404, status: "", score: 0, passed: 0, total: 0, results: [], times: [] };
    if (isNoTestCase) return { error: "No test cases for problem", httpStatus: 400, status: "", score: 0, passed: 0, total: 0, results: [], times: [] };

    // Grader is offline — record the attempt before returning the error.
    await recordOfflineSubmission(
      { userId: user.id, problemId, code, languageId },
      count ?? 0
    );

    return { error: message, httpStatus: 503, status: "GRADER_OFFLINE", score: 0, passed: 0, total: 0, results: [], times: [] };
  }
}
