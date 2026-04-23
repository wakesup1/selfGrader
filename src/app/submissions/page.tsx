import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

type SubmissionRow = {
  id: number;
  user_id: string;
  problem_id: number;
  language_id: number;
  status: string;
  score: number;
  created_at: string;
  profiles: { username: string } | null;
  problems: { title: string } | null;
};

function statusClass(status: string) {
  if (status === "AC") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (status === "WA") return "border-rose-500/40 bg-rose-500/10 text-rose-300";
  if (status === "TLE") return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-zinc-600 bg-zinc-800 text-zinc-300";
}

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("submissions")
    .select("id, user_id, problem_id, language_id, status, score, created_at, profiles(username), problems(title)")
    .order("created_at", { ascending: false })
    .limit(150)
    .returns<SubmissionRow[]>();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Submission History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Latest Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data ?? []).map((submission) => (
            <Link
              href={`/submissions/${submission.id}`}
              key={submission.id}
              className="grid grid-cols-12 items-center rounded-md border border-zinc-900 p-3 text-sm transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <span className="col-span-1 text-zinc-500">#{submission.id}</span>
              <span className="col-span-3 truncate text-zinc-200">{submission.profiles?.username ?? "unknown"}</span>
              <span className="col-span-4 truncate text-zinc-300">{submission.problems?.title ?? `Problem ${submission.problem_id}`}</span>
              <span className="col-span-2 text-zinc-400">
                {JUDGE0_LANGUAGE_MAP[submission.language_id as 54 | 62 | 71]?.label ?? submission.language_id}
              </span>
              <span className="col-span-1">
                <Badge className={statusClass(submission.status)}>{submission.status}</Badge>
              </span>
              <span className="col-span-1 text-right text-cyan-300">{submission.score}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
