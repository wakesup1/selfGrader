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
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <LeaderboardTable rows={data ?? []} />
    </section>
  );
}
