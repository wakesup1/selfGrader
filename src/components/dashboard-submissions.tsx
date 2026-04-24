"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL } from "@/lib/utils";
import { RelativeTime } from "@/components/relative-time";
import { IconBrewed, IconBurnt, IconSteeping, IconTimeout, IconSpilled, IconCompileErr } from "@/components/icons";

type SubmissionRow = {
  id: number;
  status: string;
  score: number;
  execution_time: number | null;
  memory: number | null;
  created_at: string;
  language_id: number;
};

const statusColor: Record<string, string> = {
  AC:  "#5C7558",
  WA:  "#8C4B42",
  TLE: "var(--amber-dark)",
  CE:  "#6B4E9E",
  RE:  "#934B1E",
};

function VerdictIcon({ status }: { status: string }) {
  if (status === "AC")  return <IconBrewed size={11} />;
  if (status === "WA")  return <IconBurnt size={11} />;
  if (status === "TLE") return <IconTimeout size={11} />;
  if (status === "CE")  return <IconCompileErr size={11} />;
  if (status === "RE")  return <IconSpilled size={11} />;
  return <IconSteeping size={11} />;
}

export function DashboardSubmissions({ problemId }: { problemId: number }) {
  const [submissions, setSubmissions] = useState<SubmissionRow[] | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/my-submissions?problemId=${problemId}`)
      .then((r) => r.json())
      .then(({ submissions: rows }) => {
        if (rows === null) {
          setIsGuest(true);
        } else {
          setSubmissions(rows);
        }
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [problemId]);

  if (loading) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Loading…
      </div>
    );
  }

  if (isGuest) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
        <Link href="/auth" style={{ color: "var(--clay)" }}>Sign in</Link> to see your submission history.
      </div>
    );
  }

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
            <RelativeTime date={sub.created_at} />
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 500,
            color: statusColor[sub.status] ?? "var(--muted)",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <VerdictIcon status={sub.status} />
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
