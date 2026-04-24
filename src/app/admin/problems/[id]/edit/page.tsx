import { notFound } from "next/navigation";
import { AdminProblemForm } from "@/components/admin-problem-form";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TestCase } from "@/lib/types";

type Problem = {
  id: number;
  title: string;
  description: string;
  constraints: string;
  difficulty: string;
  points: number;
  time_limit: number;
  memory_limit: number;
  is_published: boolean;
  pdf_url: string | null;
};

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problemId = Number(id);

  if (Number.isNaN(problemId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  if (!profile?.is_admin) notFound();

  const [{ data: problem }, { data: testCases }] = await Promise.all([
    admin
      .from("problems")
      .select("id, title, description, constraints, difficulty, points, time_limit, memory_limit, is_published, pdf_url")
      .eq("id", problemId)
      .single<Problem>(),
    admin
      .from("test_cases")
      .select("id, input, expected_output, is_sample")
      .eq("problem_id", problemId)
      .order("id", { ascending: true })
      .returns<Pick<TestCase, "id" | "input" | "expected_output" | "is_sample">[]>(),
  ]);

  if (!problem) notFound();

  return (
    <AdminProblemForm
      initial={{
        ...problem,
        testCases: testCases ?? [],
      }}
    />
  );
}
