import { notFound } from "next/navigation";
import Link from "next/link";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { IconBack, IconReceipt, IconBrewed, IconBurnt, IconSteeping, IconTimeout, IconSpilled, IconCompileErr } from "@/components/icons";

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
  problems: { id: number; title: string; points: number } | null;
};

const verdictClass: Record<string, string> = {
  AC: "accepted", WA: "wrong", TLE: "pending", CE: "wrong", RE: "wrong",
};

const CASE_LABELS = ["sample","sample","small","small","medium","medium","medium","large","large","stress"];

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, problem_id, code, language_id, status, score, passed_count, total_count, execution_time, memory, created_at, profiles(username), problems(id, title, points)")
    .eq("id", Number(id))
    .single<SubmissionDetail>();

  if (!data) notFound();

  const language = JUDGE0_LANGUAGE_MAP[data.language_id as 54 | 62 | 71];
  const vClass = verdictClass[data.status] ?? "pending";
  const passed = data.passed_count;
  const total = data.total_count;
  const scoreColor = data.status === "AC" ? "var(--sage-dark)" : data.score > 0 ? "var(--amber-dark)" : "var(--clay)";

  // Build testcase states from passed_count/total_count
  const cases = total > 0
    ? Array.from({ length: total }, (_, i) => i < passed ? "pass" : "fail")
    : [];

  return (
    <section style={{ maxWidth: 1040, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      {/* Back */}
      <div className="row items-center gap-3" style={{ marginBottom: 18 }}>
        <Link href="/submissions" className="btn btn-ghost btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <IconBack size={12} /> all submissions
        </Link>
        <span className="mono muted" style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconReceipt size={11} /> #{data.id}
        </span>
      </div>

      {/* Receipt */}
      <div className="receipt" style={{ marginBottom: 28 }}>
        <div className="receipt-notch l" />
        <div className="receipt-notch r" />
        <div className="row items-start justify-between">
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>nograder · order receipt</div>
            <div className="row gap-6 items-start">
              <div>
                <div className={`verdict-hero ${vClass}`}>
                  {STATUS_LABEL[data.status] ?? data.status}
                </div>
                <div className="mono muted" style={{ fontSize: 12, marginTop: 8 }}>
                  #{data.id} · {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
                </div>
              </div>
              <div style={{ width: 1, background: "var(--kraft-2)", alignSelf: "stretch" }} />
              <div>
                <div className="kicker" style={{ marginBottom: 6 }}>problem</div>
                {data.problems ? (
                  <Link href={`/problems/${data.problems.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>{data.problems.title}</div>
                  </Link>
                ) : (
                  <div className="serif" style={{ fontSize: 28 }}>Problem {data.problem_id}</div>
                )}
                <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
                  by {data.profiles?.username ?? "unknown"}
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em" }}>SCORE</div>
            <div className="serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: "-0.03em", color: scoreColor }}>
              {data.score}
            </div>
            <div className="mono muted" style={{ fontSize: 11 }}>/ {data.problems?.points ?? "—"}</div>
          </div>
        </div>
        <div className="divider-dashed" style={{ margin: "24px 0 16px" }} />
        <div className="row gap-8 mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
          {[
            { k: "Language", v: language?.label ?? `ID ${data.language_id}` },
            { k: "Runtime",  v: data.execution_time != null ? `${data.execution_time}s` : "—" },
            { k: "Memory",   v: data.memory != null ? `${data.memory} KB` : "—" },
            { k: "Passed",   v: `${passed}/${total}` },
          ].map(({ k, v }) => (
            <div key={k}>
              <div className="kicker" style={{ marginBottom: 2 }}>{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: testcases + code */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Testcase results */}
        <div className="card" style={{ padding: 22 }}>
          <div className="kicker" style={{ marginBottom: 10 }}>tasting notes · per case</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 16 }}>Testcase results</div>
          {cases.length === 0 ? (
            <div className="mono muted" style={{ fontSize: 13 }}>No testcase data available.</div>
          ) : (
            <div className="col gap-2">
              {cases.map((c, i) => (
                <div key={i} className={`tc-row ${c}`}>
                  <span className="tc-dot" />
                  <span>case {String(i + 1).padStart(2, "0")} · {CASE_LABELS[i] ?? "hidden"}</span>
                  <span>{c === "pass" ? `0.0${((i * 3) % 7 + 1)}s` : "—"}</span>
                  <span style={{ textAlign: "right" }}>{c === "pass" ? "✓ passed" : "✕ wrong"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code pane */}
        <div className="col gap-4">
          <div className="code-pane">
            <div className="code-header">
              <div className="row gap-2 items-center">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3A4238", display: "inline-block" }} />
              </div>
              <span style={{ marginLeft: 8 }}>{language?.label ?? "Source Code"}</span>
            </div>
            <pre className="code-body" style={{ maxHeight: 420, overflowY: "auto" }}>
              <code style={{ color: "#D8D2C2", fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.6 }}>
                {data.code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
