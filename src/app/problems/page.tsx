import { ProblemList } from "@/components/problem-list";
import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/lib/types";

export const revalidate = 0;

export default async function ProblemsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("problems")
    .select("id, title, slug, description, constraints, time_limit, memory_limit, difficulty, points, is_published, created_at")
    .eq("is_published", true)
    .order("id", { ascending: true })
    .returns<Problem[]>();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Problem Set</h1>
        <p className="mt-1 text-zinc-400">Pick one problem and submit your best solution.</p>
      </div>
      <ProblemList problems={data ?? []} />
    </section>
  );
}
