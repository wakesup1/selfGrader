import { notFound } from "next/navigation";
import { ProblemEditor } from "@/components/problem-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSubmissions } from "@/components/dashboard-submissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import type { Problem, TestCase } from "@/lib/types";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problemId = Number(id);

  if (Number.isNaN(problemId)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: problem } = await supabase
    .from("problems")
    .select("id, title, slug, description, constraints, time_limit, memory_limit, difficulty, points, is_published, created_at")
    .eq("id", problemId)
    .eq("is_published", true)
    .single<Problem>();

  if (!problem) {
    notFound();
  }

  const { data: sampleCases } = await supabase
    .from("test_cases")
    .select("id, problem_id, input, expected_output, is_sample")
    .eq("problem_id", problemId)
    .eq("is_sample", true)
    .returns<TestCase[]>();

  return (
    <section className="mx-auto w-full max-w-7xl gap-6 px-4 py-8 lg:px-8">
      {/* Top Banner: Problem Title & Info */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-100">{problem.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-500">
              {problem.difficulty}
            </span>
            <span>{problem.points} Points</span>
            <span>{problem.time_limit}s Limit</span>
            <span>{problem.memory_limit}MB Memory</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Side: Descriptions and Dashboard */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="description" className="flex-1">
            <TabsList className="w-full justify-start bg-slate-900 border-slate-800 rounded-lg p-1">
              <TabsTrigger value="description" className="data-[state=active]:bg-slate-800 data-[state=active]:text-blue-400">
                Problem Description
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-blue-400">
                My Submissions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4 space-y-6">
              <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p>{problem.description}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
                <pre className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                  {problem.constraints || "-"}
                </pre>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Sample Test Cases</h3>
                <div className="space-y-4">
                  {(sampleCases ?? []).map((testCase, index) => (
                    <div key={testCase.id} className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-400">
                        Example {index + 1}
                      </div>
                      <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
                        <div className="bg-slate-900 p-4">
                          <p className="mb-2 text-xs font-bold text-slate-500">Input</p>
                          <pre className="font-mono text-sm text-blue-300">{testCase.input || "(empty)"}</pre>
                        </div>
                        <div className="bg-slate-900 p-4">
                          <p className="mb-2 text-xs font-bold text-slate-500">Expected Output</p>
                          <pre className="font-mono text-sm text-green-400">{testCase.expected_output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions">
              <div className="mt-4">
                <DashboardSubmissions problemId={problemId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Split Screen Editor/Console */}
        <div className="flex h-full min-h-[80vh] flex-col">
          <ProblemEditor problemId={problemId} />
        </div>
      </div>
    </section>
  );
}
