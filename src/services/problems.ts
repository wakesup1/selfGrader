/**
 * Problems service — admin-level CRUD for problems and test cases.
 *
 * All writes use the admin Supabase client (service-role key, bypasses RLS).
 * Callers MUST verify is_admin before calling any mutating function.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createSlug } from "@/lib/utils";

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

  const { data: problem, error: problemError } = await admin
    .from("problems")
    .insert({
      title:       input.title,
      slug:        createSlug(input.title),
      description: input.description,
      constraints: input.constraints,
      difficulty:  input.difficulty,
      points:      input.points,
      time_limit:  input.time_limit,
      memory_limit: input.memory_limit,
      created_by:  input.createdBy,
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

  // Run the problem update and test-case wipe in parallel; insert must
  // follow the delete to avoid FK conflicts.
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
}

// ---------------------------------------------------------------------------
// Auth guard helper (shared by both admin route handlers)
// ---------------------------------------------------------------------------

/**
 * Returns true if the given user ID belongs to an admin.
 * Uses the admin client so this check is never blocked by RLS.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single<{ is_admin: boolean }>();
  return data?.is_admin === true;
}
