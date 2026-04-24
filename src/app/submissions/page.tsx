import { createClient } from "@/lib/supabase/server";
import { SubmissionsList } from "@/components/submissions-list";

type SubmissionRow = {
  id: number;
  user_id: string;
  problem_id: number;
  language_id: number;
  status: string;
  score: number;
  passed_count: number;
  total_count: number;
  execution_time: number | null;
  created_at: string;
  profiles: { username: string } | null;
  problems: { title: string } | null;
};

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("submissions")
    .select("id, user_id, problem_id, language_id, status, score, passed_count, total_count, execution_time, created_at, profiles(username), problems(title)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<SubmissionRow[]>();

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <SubmissionsList rows={data ?? []} />
    </section>
  );
}
