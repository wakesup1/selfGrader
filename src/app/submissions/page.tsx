import Link from "next/link";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

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

const statusStyle: Record<string, { bg: string; color: string; border: string }> = {
  AC:  { bg: "var(--sage-bg)",  color: "#5C7558",       border: "#CFD9C7" },
  WA:  { bg: "var(--clay-bg)",  color: "#8C4B42",       border: "#E3C4BE" },
  TLE: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  CE:  { bg: "#EDE8F5",         color: "#6B4E9E",       border: "#D3C6E8" },
  RE:  { bg: "#FEF0E6",         color: "#934B1E",       border: "#F0CDB0" },
};
function statusChipStyle(status: string) {
  return statusStyle[status] ?? { bg: "var(--bg-warm)", color: "var(--muted)", border: "var(--kraft-2)" };
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
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="kicker" style={{ marginBottom: 8 }}>submission history · {data?.length ?? 0} entries</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.025em", margin: 0, color: "var(--ink)" }}>
          Submissions
        </h1>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "56px 120px 1fr 80px 72px 64px 110px",
          gap: 12, padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          fontFamily: "var(--mono)", fontSize: 10.5,
          letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)",
        }}>
          <span>ID</span>
          <span>User</span>
          <span>Problem</span>
          <span>Lang</span>
          <span>Verdict</span>
          <span style={{ textAlign: "right" }}>Score</span>
          <span style={{ textAlign: "right" }}>Time</span>
        </div>

        {(data ?? []).map((sub, i) => {
          const chip = statusChipStyle(sub.status);
          return (
            <Link
              key={sub.id}
              href={`/submissions/${sub.id}`}
              style={{
                display: "grid", gridTemplateColumns: "56px 120px 1fr 80px 72px 64px 110px",
                gap: 12, padding: "14px 20px", alignItems: "center",
                borderBottom: i < (data ?? []).length - 1 ? "1px solid var(--line-soft)" : "none",
                textDecoration: "none", color: "inherit", transition: "background 0.1s",
              }}
              className="problem-row-hover"
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted-2)" }}>#{sub.id}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sub.profiles?.username ?? "—"}
              </span>
              <span style={{ fontSize: 13.5, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sub.problems?.title ?? `Problem ${sub.problem_id}`}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)" }}>
                {JUDGE0_LANGUAGE_MAP[sub.language_id as 54 | 62 | 71]?.label ?? sub.language_id}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center",
                padding: "3px 8px", borderRadius: 999,
                fontFamily: "var(--mono)", fontSize: 10.5,
                background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                width: "fit-content",
              }}>
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--clay)", textAlign: "right" }}>
                {sub.score}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted-2)", textAlign: "right" }}>
                {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
              </span>
            </Link>
          );
        })}

        {(data ?? []).length === 0 && (
          <p style={{ padding: "48px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            No submissions yet.
          </p>
        )}
      </div>
    </section>
  );
}
