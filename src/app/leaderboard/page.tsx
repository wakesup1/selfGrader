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
    <section style={{ maxWidth: 900, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="kicker" style={{ marginBottom: 8 }}>hall of fame · top {data?.length ?? 0}</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.025em", margin: 0, color: "var(--ink)" }}>
          Leaderboard
        </h1>
        <p style={{ marginTop: 10, color: "var(--ink-soft)", fontSize: 15 }}>
          Rankings by total score. Ties broken by problems solved.
        </p>
      </div>
      <LeaderboardTable rows={data ?? []} />
    </section>
  );
}
