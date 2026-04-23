import { LeaderboardTable } from "@/components/leaderboard-table";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, total_score, solved_count, is_admin")
    .order("total_score", { ascending: false })
    .order("solved_count", { ascending: false })
    .limit(100)
    .returns<Profile[]>();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Leaderboard</h1>
      <LeaderboardTable rows={data ?? []} />
    </section>
  );
}
