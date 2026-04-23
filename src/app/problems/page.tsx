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
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="kicker" style={{ marginBottom: 8 }}>the menu · {data?.length ?? 0} items</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.025em", margin: 0, color: "var(--ink)" }}>
          Problems
        </h1>
        <p style={{ marginTop: 10, color: "var(--ink-soft)", fontSize: 15 }}>
          Pick what looks good. Every problem is handcrafted — filter by topic, difficulty, or what you&apos;re in the mood for.
        </p>
      </div>
      <ProblemList problems={data ?? []} />
    </section>
  );
}
