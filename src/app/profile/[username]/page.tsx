import { notFound } from "next/navigation";
import Link from "next/link";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import type { Profile } from "@/lib/types";

type Submission = {
  id: number;
  problem_id: number;
  language_id: number;
  status: string;
  score: number;
  created_at: string;
  problems: { title: string } | null;
};

const statusColor: Record<string, string> = {
  AC:  "#5C7558", WA: "#8C4B42", TLE: "var(--amber-dark)",
  CE:  "#6B4E9E", RE: "#934B1E",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, total_score, solved_count, is_admin, created_at")
    .eq("username", decodeURIComponent(username))
    .single<Profile & { created_at: string }>();

  if (!profile) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, problem_id, language_id, status, score, created_at, problems(title)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Submission[]>();

  const initial = profile.username[0].toUpperCase();

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--amber), var(--sage))",
          display: "grid", placeItems: "center",
          color: "white", fontSize: 28, fontFamily: "var(--serif)",
          border: "3px solid var(--surface)", boxShadow: "0 0 0 1px var(--kraft-2)",
        }}>
          {initial}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--ink)", margin: 0, fontWeight: 400, letterSpacing: "-0.02em" }}>
              {profile.username}
            </h1>
            {profile.is_admin && (
              <span style={{
                padding: "3px 10px", borderRadius: 999,
                fontFamily: "var(--mono)", fontSize: 10.5,
                background: "var(--clay-bg)", color: "var(--clay)", border: "1px solid #E3C4BE",
              }}>
                Admin
              </span>
            )}
          </div>
          <p style={{ marginTop: 4, fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { label: "Total Score",      value: String(profile.total_score), accent: true },
          { label: "Problems Solved",  value: String(profile.solved_count) },
          { label: "Recent Activity",  value: `${submissions?.length ?? 0} shown` },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: 12, padding: "20px 20px 18px", boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 36, lineHeight: 1, color: accent ? "var(--clay)" : "var(--ink)", letterSpacing: "-0.03em" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", margin: "0 0 16px", fontWeight: 400 }}>
          Recent Submissions
        </h2>
        {submissions && submissions.length > 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 100px 56px 80px 100px",
              gap: 12, padding: "10px 20px", borderBottom: "1px solid var(--line)",
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--muted)",
            }}>
              <span>Problem</span>
              <span>Lang</span>
              <span>Verdict</span>
              <span style={{ textAlign: "right" }}>Score</span>
              <span style={{ textAlign: "right" }}>When</span>
            </div>

            {submissions.map((sub, i) => (
              <div key={sub.id} style={{
                display: "grid", gridTemplateColumns: "1fr 100px 56px 80px 100px",
                gap: 12, padding: "14px 20px", alignItems: "center",
                borderBottom: i < submissions.length - 1 ? "1px solid var(--line-soft)" : "none",
              }}>
                <Link href={`/problems/${sub.problem_id}`} style={{ fontSize: 13.5, color: "var(--ink)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  className="problem-row-hover-text">
                  {sub.problems?.title ?? `#${sub.problem_id}`}
                </Link>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)" }}>
                  {JUDGE0_LANGUAGE_MAP[sub.language_id as 54 | 62 | 71]?.label ?? sub.language_id}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 500, color: statusColor[sub.status] ?? "var(--muted)" }}>
                  {STATUS_LABEL[sub.status] ?? sub.status}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--clay)", textAlign: "right" }}>
                  {sub.score}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted-2)", textAlign: "right" }}>
                  {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>No submissions yet.</p>
        )}
      </div>
    </section>
  );
}
