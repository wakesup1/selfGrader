/**
 * Problems service — admin-level CRUD for problems and test cases.
 *
 * All writes use the admin Supabase client (service-role key, bypasses RLS).
 * After each create/update the problem is synced to cafe-grader's MySQL so
 * that submissions can be graded immediately.
 *
 * Callers MUST verify isAdmin() before calling any mutating function.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createSlug } from "@/lib/utils";
import { syncProblemToCafeGrader } from "@/services/cafeGraderSync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TestCaseInput = {
  id?: number;
  input: string;
  expected_output: string;
  is_sample: boolean;
};

export type CreateProblemInput = {
  title: string;
  description: string;
  constraints: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  time_limit: number;
  memory_limit: number;
  createdBy: string;
  testCases: TestCaseInput[];
};

export type UpdateProblemInput = Omit<CreateProblemInput, "createdBy"> & {
  is_published: boolean;
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createProblem(input: CreateProblemInput): Promise<number> {
  const admin = createAdminClient();
  const slug  = createSlug(input.title);

  const { data: problem, error: problemError } = await admin
    .from("problems")
    .insert({
      title:        input.title,
      slug,
      description:  input.description,
      constraints:  input.constraints,
      difficulty:   input.difficulty,
      points:       input.points,
      time_limit:   input.time_limit,
      memory_limit: input.memory_limit,
      created_by:   input.createdBy,
    })
    .select("id")
    .single<{ id: number }>();

  if (problemError || !problem) {
    throw new Error(problemError?.message ?? "Failed to create problem");
  }

  const { error: tcError } = await admin.from("test_cases").insert(
    input.testCases.map((tc) => ({
      problem_id:      problem.id,
      input:           tc.input,
      expected_output: tc.expected_output,
      is_sample:       tc.is_sample,
    }))
  );

  if (tcError) throw new Error(tcError.message);

  // Sync to cafe-grader (best-effort — don't fail the create if sync errors)
  try {
    await syncProblemToCafeGrader({
      supabaseProblemId:            problem.id,
      existingCafeGraderProblemId:  null,
      slug,
      title:       input.title,
      timeLimit:   input.time_limit,
      memoryLimit: input.memory_limit,
      testCases:   input.testCases,
    });
  } catch (err) {
    console.error("[problems] cafe-grader sync failed for new problem", problem.id, err);
  }

  return problem.id;
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateProblem(
  problemId: number,
  input: UpdateProblemInput
): Promise<void> {
  const admin = createAdminClient();

  // Fetch existing slug and cafe_grader_problem_id before mutating
  const { data: existing } = await admin
    .from("problems")
    .select("slug, cafe_grader_problem_id")
    .eq("id", problemId)
    .single<{ slug: string; cafe_grader_problem_id: number | null }>();

  // Run problem update and test-case wipe in parallel; insert must follow delete.
  const [{ error: updateError }, { error: deleteError }] = await Promise.all([
    admin
      .from("problems")
      .update({
        title:        input.title,
        description:  input.description,
        constraints:  input.constraints,
        difficulty:   input.difficulty,
        points:       input.points,
        time_limit:   input.time_limit,
        memory_limit: input.memory_limit,
        is_published: input.is_published,
      })
      .eq("id", problemId),
    admin.from("test_cases").delete().eq("problem_id", problemId),
  ]);

  if (updateError) throw new Error(updateError.message);
  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await admin.from("test_cases").insert(
    input.testCases.map((tc) => ({
      problem_id:      problemId,
      input:           tc.input,
      expected_output: tc.expected_output,
      is_sample:       tc.is_sample,
    }))
  );

  if (insertError) throw new Error(insertError.message);

  // Sync to cafe-grader (best-effort)
  try {
    await syncProblemToCafeGrader({
      supabaseProblemId:            problemId,
      existingCafeGraderProblemId:  existing?.cafe_grader_problem_id ?? null,
      slug:        existing?.slug ?? createSlug(input.title),
      title:       input.title,
      timeLimit:   input.time_limit,
      memoryLimit: input.memory_limit,
      testCases:   input.testCases,
    });
  } catch (err) {
    console.error("[problems] cafe-grader sync failed for problem", problemId, err);
  }
}

// ---------------------------------------------------------------------------
// Auth guard helper
// ---------------------------------------------------------------------------

export async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single<{ is_admin: boolean }>();
  return data?.is_admin === true;
}
