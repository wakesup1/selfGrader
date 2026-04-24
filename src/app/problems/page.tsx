import { ProblemsTableFull } from "@/components/problems-table-full";
import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/lib/types";
import type { ProblemWithStat } from "@/app/page";

export const revalidate = 0;

export default async function ProblemsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: problems }, statsResult] = await Promise.all([
    supabase
      .from("problems")
      .select("id, title, slug, description, constraints, time_limit, memory_limit, difficulty, points, is_published, created_at")
      .eq("is_published", true)
      .order("id", { ascending: true })
      .returns<Problem[]>(),
    user
      ? supabase
          .from("user_problem_stats")
          .select("problem_id, best_score, is_solved")
          .eq("user_id", user.id)
          .returns<{ problem_id: number; best_score: number; is_solved: boolean }[]>()
      : Promise.resolve({ data: [] }),
  ]);

  const statsMap = new Map((statsResult.data ?? []).map((s) => [s.problem_id, s]));

  const problemsWithStats: ProblemWithStat[] = (problems ?? []).map((p) => ({
    ...p,
    userStat: statsMap.get(p.id) ?? null,
  }));

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <ProblemsTableFull problems={problemsWithStats} isLoggedIn={!!user} />
    </section>
  );
}
