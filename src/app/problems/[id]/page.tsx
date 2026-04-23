import { notFound } from "next/navigation";
import { ProblemEditor } from "@/components/problem-editor";
import { DashboardSubmissions } from "@/components/dashboard-submissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/markdown-content";
import { createClient } from "@/lib/supabase/server";
import type { Problem, TestCase } from "@/lib/types";

const difficultyChip: Record<Problem["difficulty"], { bg: string; color: string; border: string }> = {
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

  const { data: problem } = await supabase
    .from("problems")
    .select("id, title, slug, description, constraints, time_limit, memory_limit, difficulty, points, is_published, created_at")
    .eq("id", problemId)
    .eq("is_published", true)
    .single<Problem>();

  if (!problem) notFound();

  const { data: sampleCases } = await supabase
    .from("test_cases")
    .select("id, problem_id, input, expected_output, is_sample")
    .eq("problem_id", problemId)
    .eq("is_sample", true)
    .returns<TestCase[]>();

  const chip = difficultyChip[problem.difficulty];

  return (
    <section style={{ maxWidth: 1480, margin: "0 auto", width: "100%", padding: "24px 32px 64px" }}>
      {/* Problem header */}
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", margin: 0, fontWeight: 400, letterSpacing: "-0.015em" }}>
            {problem.title}
          </h1>
          <span style={{
            padding: "3px 10px", borderRadius: 999,
            fontFamily: "var(--mono)", fontSize: 11,
            background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
          }}>
            {problem.difficulty}
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
          <span>{problem.points} pts</span>
          <span>·</span>
          <span>{problem.time_limit}s</span>
          <span>·</span>
          <span>{problem.memory_limit} MB</span>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)" }}>
        {/* Left: description panel */}
        <div>
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start rounded-lg border border-stone-200 bg-stone-50 p-1 mb-4">
              <TabsTrigger
                value="description"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                My Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-5">
              <MarkdownContent content={problem.description} />

              {problem.constraints && (
                <div>
                  <div className="label" style={{ marginBottom: 8 }}>Constraints</div>
                  <pre style={{
                    borderRadius: 8, border: "1px solid var(--line)",
                    background: "var(--bg-warm)", padding: "12px 14px",
                    fontSize: 12.5, fontFamily: "var(--mono)",
                    color: "var(--ink-soft)", lineHeight: 1.7,
                    whiteSpace: "pre-wrap", margin: 0,
                  }}>
                    {problem.constraints}
                  </pre>
                </div>
              )}

              {(sampleCases ?? []).length > 0 && (
                <div>
                  <div className="label" style={{ marginBottom: 12 }}>Examples</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(sampleCases ?? []).map((tc, i) => (
                      <div key={tc.id} style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{
                          padding: "8px 14px", borderBottom: "1px solid var(--line-soft)",
                          background: "var(--bg-warm)", fontFamily: "var(--mono)", fontSize: 10.5,
                          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)",
                        }}>
                          Example {i + 1}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                          <div style={{ padding: "12px 14px", borderRight: "1px solid var(--line-soft)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 6 }}>Input</div>
                            <pre style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink)", margin: 0 }}>{tc.input || "(empty)"}</pre>
                          </div>
                          <div style={{ padding: "12px 14px" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 6 }}>Output</div>
                            <pre style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--clay)", margin: 0 }}>{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submissions">
              <DashboardSubmissions problemId={problemId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: editor + console */}
        <div style={{ minHeight: "78vh" }}>
          <ProblemEditor problemId={problemId} />
        </div>
      </div>
    </section>
  );
}
