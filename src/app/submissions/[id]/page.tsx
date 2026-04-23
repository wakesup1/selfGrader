import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

type SubmissionDetail = {
  id: number;
  code: string;
  language_id: number;
  status: string;
  score: number;
  passed_count: number;
  total_count: number;
  execution_time: number | null;
  memory: number | null;
  created_at: string;
  profiles: { username: string } | null;
  problems: { title: string } | null;
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, code, language_id, status, score, passed_count, total_count, execution_time, memory, created_at, profiles(username), problems(title)")
    .eq("id", Number(id))
    .single<SubmissionDetail>();

  if (!data) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submission #{data.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>User: {data.profiles?.username ?? "unknown"}</p>
          <p>Problem: {data.problems?.title ?? "unknown"}</p>
          <p>Language: {JUDGE0_LANGUAGE_MAP[data.language_id as 54 | 62 | 71]?.label ?? data.language_id}</p>
          <p>Status: {data.status}</p>
          <p>Score: {data.score}</p>
          <p>Passed: {data.passed_count}/{data.total_count}</p>
          <p>Runtime: {data.execution_time ?? "-"} sec</p>
          <p>Memory: {data.memory ?? "-"} KB</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-100">
            {data.code}
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}
