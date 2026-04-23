import { notFound } from "next/navigation";
import { ProblemEditor } from "@/components/problem-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{problem.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <p>{problem.description}</p>
            <div>
              <h4 className="mb-1 text-zinc-100">Constraints</h4>
              <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300">
                {problem.constraints || "-"}
              </pre>
            </div>
            <p className="text-zinc-400">
              Time limit: {problem.time_limit}s | Memory limit: {problem.memory_limit}MB | Points: {problem.points}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Test Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(sampleCases ?? []).map((testCase, index) => (
              <div key={testCase.id} className="rounded-lg border border-zinc-800 p-3">
                <p className="mb-2 text-xs text-zinc-500">Sample #{index + 1}</p>
                <p className="text-xs text-zinc-400">Input</p>
                <pre className="mb-2 overflow-auto rounded bg-zinc-900 p-2 text-zinc-200">{testCase.input || "(empty)"}</pre>
                <p className="text-xs text-zinc-400">Output</p>
                <pre className="overflow-auto rounded bg-zinc-900 p-2 text-zinc-200">{testCase.expected_output}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <ProblemEditor problemId={problemId} />
    </section>
  );
}
