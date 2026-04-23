import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const statusColor: Record<string, string> = {
  AC:  "#5C7558", WA: "#8C4B42", TLE: "var(--amber-dark)",
  CE:  "#6B4E9E", RE: "#934B1E",
};

export async function DashboardSubmissions({ problemId }: { problemId: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
        <Link href="/auth" style={{ color: "var(--clay)" }}>Sign in</Link> to see your submission history.
      </div>
    );
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, status, score, execution_time, memory, created_at, language_id")
    .eq("problem_id", problemId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!submissions || submissions.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
        No submissions yet. Run your code to see history.
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 80px 56px 70px",
        gap: 8, padding: "10px 14px",
        borderBottom: "1px solid var(--line)",
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--muted)",
      }}>
        <span>Time</span>
        <span>Verdict</span>
        <span style={{ textAlign: "right" }}>Score</span>
        <span style={{ textAlign: "right" }}>Runtime</span>
      </div>

      {submissions.map((sub, i) => (
        <Link
          key={sub.id}
          href={`/submissions/${sub.id}`}
          style={{
            display: "grid", gridTemplateColumns: "1fr 80px 56px 70px",
            gap: 8, padding: "12px 14px", alignItems: "center",
            borderBottom: i < submissions.length - 1 ? "1px solid var(--line-soft)" : "none",
            textDecoration: "none", color: "inherit",
          }}
          className="problem-row-hover"
        >
          <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted-2)" }}>
            {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 500,
            color: statusColor[sub.status] ?? "var(--muted)",
          }}>
            {STATUS_LABEL[sub.status] ?? sub.status}
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>
            {sub.score}
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted-2)", textAlign: "right" }}>
            {sub.execution_time ? `${sub.execution_time}s` : "—"}
          </span>
        </Link>
      ))}
    </div>
  );
}
