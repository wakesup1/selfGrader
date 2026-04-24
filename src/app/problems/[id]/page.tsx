import { notFound } from "next/navigation";
import { ProblemEditor } from "@/components/problem-editor";
import { DashboardSubmissions } from "@/components/dashboard-submissions";
import { MarkdownContent } from "@/components/markdown-content";
import { createClient } from "@/lib/supabase/server";
import type { Problem, TestCase } from "@/lib/types";

const diffChip: Record<string, { bg: string; color: string; border: string }> = {
  Easy:   { bg: "var(--sage-bg)",  color: "#5C7558",           border: "#CFD9C7" },
  Medium: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  Hard:   { bg: "var(--clay-bg)",  color: "#8C4B42",           border: "#E3C4BE" },
};

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problemId = Number(id);
  if (Number.isNaN(problemId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: problem }, { data: sampleCases }, userStatResult] = await Promise.all([
    supabase
      .from("problems")
      .select("id, title, slug, description, constraints, time_limit, memory_limit, difficulty, points, is_published, pdf_url, created_at")
      .eq("id", problemId)
      .eq("is_published", true)
      .single<Problem>(),
    supabase
      .from("test_cases")
      .select("id, problem_id, input, expected_output, is_sample")
      .eq("problem_id", problemId)
      .eq("is_sample", true)
      .returns<TestCase[]>(),
    user
      ? supabase
          .from("user_problem_stats")
          .select("best_score, is_solved")
          .eq("problem_id", problemId)
          .eq("user_id", user.id)
          .maybeSingle<{ best_score: number; is_solved: boolean }>()
      : Promise.resolve({ data: null }),
  ]);

  if (!problem) notFound();

  const userStat = userStatResult.data ?? null;
  const chip = diffChip[problem.difficulty] ?? diffChip.Medium;
  const scorePercent = userStat ? Math.round((userStat.best_score / problem.points) * 100) : 0;
  const scoreTone = userStat?.is_solved ? "" : userStat && userStat.best_score > 0 ? "amber" : "clay";

  return (
    <div className="page" style={{ padding: "24px 32px 64px" }}>
      {/* Problem header */}
      <div className="row items-start justify-between gap-6" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {problem.difficulty.toLowerCase()} · {problem.points} pts
          </div>
          <h1 className="serif" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.025em", margin: "0 0 10px" }}>
            {problem.title}
          </h1>
          <div className="row gap-2 items-center" style={{ flexWrap: "wrap" }}>
            <span className={`chip ${chip.bg === "var(--sage-bg)" ? "chip-sage" : chip.bg === "var(--amber-bg)" ? "chip-amber" : "chip-clay"}`}>
              {problem.difficulty}
            </span>
            <span className="chip">Time limit {problem.time_limit}s</span>
            <span className="chip">Memory {problem.memory_limit} MB</span>
          </div>
        </div>

        {/* Your tab card */}
        <div className="card-kraft" style={{ padding: 18, minWidth: 220, flexShrink: 0 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>your tab</div>
          <div className="row justify-between items-baseline" style={{ marginBottom: 6 }}>
            <span className="serif" style={{ fontSize: 30, lineHeight: 1 }}>
              {userStat ? userStat.best_score : 0}
            </span>
            <span className="mono muted" style={{ fontSize: 11 }}>/ {problem.points}</span>
          </div>
          <div className={`progress ${scoreTone}`}>
            <span style={{ width: `${scorePercent}%` }} />
          </div>
          <div className="mono muted" style={{ fontSize: 11, marginTop: 10 }}>
            {userStat
              ? userStat.is_solved
                ? "✓ solved"
                : userStat.best_score > 0
                  ? "partial — keep going"
                  : "attempted — no score yet"
              : "not attempted yet"}
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 28 }}>
        {/* LEFT — prompt panel */}
        <div>
          <ProblemDescriptionPanel
            problem={problem}
            sampleCases={sampleCases ?? []}
            problemId={problemId}
          />
        </div>

        {/* RIGHT — editor + testcases */}
        <div style={{ minHeight: "70vh" }}>
          <ProblemEditor problemId={problemId} />
        </div>
      </div>
    </div>
  );
}

// Server component for the description panel with tabs
async function ProblemDescriptionPanel({
  problem,
  sampleCases,
  problemId,
}: {
  problem: Problem;
  sampleCases: TestCase[];
  problemId: number;
}) {
  // We use a client component for tabs interactivity
  const { ProblemDescTabs } = await import("@/components/problem-desc-tabs");
  return (
    <ProblemDescTabs
      problem={problem}
      sampleCases={sampleCases}
      problemId={problemId}
    />
  );
}
