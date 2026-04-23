import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

type SubmissionDetail = {
  id: number;
  problem_id: number;
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
  problems: { id: number; title: string } | null;
};

const verdictClass: Record<string, string> = {
  AC: "accepted", WA: "wrong", TLE: "pending", CE: "wrong", RE: "wrong",
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
    .select("id, problem_id, code, language_id, status, score, passed_count, total_count, execution_time, memory, created_at, profiles(username), problems(id, title)")
    .eq("id", Number(id))
    .single<SubmissionDetail>();

  if (!data) notFound();

  const language = JUDGE0_LANGUAGE_MAP[data.language_id as 54 | 62 | 71];
  const vClass = verdictClass[data.status] ?? "pending";

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      {/* Back */}
      {data.problems && (
        <Link href={`/problems/${data.problems.id}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 24,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} />
          {data.problems.title}
        </Link>
      )}

      {/* Receipt header */}
      <div className="receipt" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>
              Submission #{data.id} · {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
            </div>
            <div className={`verdict-hero ${vClass}`}>
              {STATUS_LABEL[data.status] ?? data.status}
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--muted)" }}>
              by <span style={{ color: "var(--ink)", fontWeight: 500 }}>{data.profiles?.username ?? "unknown"}</span>
              {data.problems?.title && (
                <> · <Link href={`/problems/${data.problems.id}`} style={{ color: "var(--clay)" }}>{data.problems.title}</Link></>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Score</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.03em", color: "var(--clay)" }}>
              {data.score}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "repeating-linear-gradient(to right, var(--kraft-2) 0, var(--kraft-2) 4px, transparent 4px, transparent 8px)", margin: "20px 0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Test Cases", value: `${data.passed_count} / ${data.total_count}` },
            { label: "Runtime",    value: data.execution_time != null ? `${data.execution_time}s` : "—" },
            { label: "Memory",     value: data.memory != null ? `${data.memory} KB` : "—" },
            { label: "Language",   value: language?.label ?? `ID ${data.language_id}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 14.5, color: "var(--ink)" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code */}
      <div style={{ background: "var(--ink-bg)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", background: "#1A201A",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "var(--mono)", fontSize: 11.5, color: "#9A9782", letterSpacing: "0.05em",
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
          <span style={{ marginLeft: 8 }}>{language?.label ?? "Source Code"}</span>
        </div>
        <pre style={{ overflow: "auto", padding: "20px 24px", fontSize: 13, lineHeight: 1.6, fontFamily: "var(--mono)", color: "#D8D2C2", margin: 0 }}>
          <code>{data.code}</code>
        </pre>
      </div>
    </section>
  );
}
