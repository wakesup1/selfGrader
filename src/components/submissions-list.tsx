"use client";

import { useState } from "react";
import Link from "next/link";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { RelativeTime } from "@/components/relative-time";
import { IconBrewed, IconBurnt, IconSteeping, IconTimeout, IconSpilled, IconCompileErr, IconChevronRight } from "@/components/icons";

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

const statusStyle: Record<string, { bg: string; color: string; border: string }> = {
  AC:  { bg: "var(--sage-bg)",  color: "#5C7558",           border: "#CFD9C7" },
  WA:  { bg: "var(--clay-bg)",  color: "#8C4B42",           border: "#E3C4BE" },
  TLE: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  CE:  { bg: "#EDE8F5",         color: "#6B4E9E",           border: "#D3C6E8" },
  RE:  { bg: "#FEF0E6",         color: "#934B1E",           border: "#F0CDB0" },
};

function chipStyle(status: string) {
  return statusStyle[status] ?? { bg: "var(--bg-warm)", color: "var(--muted)", border: "var(--kraft-2)" };
}

function VerdictIcon({ status, size = 11 }: { status: string; size?: number }) {
  if (status === "AC")  return <IconBrewed size={size} />;
  if (status === "WA")  return <IconBurnt size={size} />;
  if (status === "TLE") return <IconTimeout size={size} />;
  if (status === "CE")  return <IconCompileErr size={size} />;
  if (status === "RE")  return <IconSpilled size={size} />;
  return <IconSteeping size={size} />;
}

type Filter = "all" | "accepted" | "partial" | "wrong";

export function SubmissionsList({ rows }: { rows: SubmissionRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = rows.filter((s) => {
    if (filter === "all") return true;
    if (filter === "accepted") return s.status === "AC";
    if (filter === "partial") return s.score > 0 && s.status !== "AC";
    if (filter === "wrong") return ["WA", "TLE", "RE", "CE"].includes(s.status);
    return true;
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-sub">your order history · {rows.length} entries</div>
          <h1 className="page-title">Submissions</h1>
          <p className="page-intro">Every cup you&apos;ve ordered. Click a receipt to see the full tasting notes and compiler messages.</p>
        </div>
        <div className="row gap-2">
          {([["all","All"],["accepted","Brewed"],["partial","Steeping"],["wrong","Burnt"]] as [Filter,string][]).map(([k,v]) => (
            <button key={k} className={`tweak-opt ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="problems-table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Order #</th>
              <th>Problem</th>
              <th style={{ width: 120 }}>Verdict</th>
              <th style={{ width: 100 }}>Score</th>
              <th style={{ width: 100 }}>Runtime</th>
              <th style={{ width: 110 }}>Language</th>
              <th style={{ width: 180 }}>When</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const chip = chipStyle(s.status);
              const lang = JUDGE0_LANGUAGE_MAP[s.language_id as 54 | 62 | 71]?.label ?? String(s.language_id);
              return (
                <tr
                  key={s.id}
                  className="clickable"
                  onClick={() => { window.location.href = `/submissions/${s.id}`; }}
                >
                  <td className="mono" style={{ fontSize: 12 }}>#{s.id}</td>
                  <td>
                    <div className="serif" style={{ fontSize: 17 }}>{s.problems?.title ?? `Problem ${s.problem_id}`}</div>
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {s.profiles?.username ?? "—"}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 9px", borderRadius: 999,
                      fontFamily: "var(--mono)", fontSize: 10.5,
                      background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                    }}>
                      <VerdictIcon status={s.status} />
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="mono" style={{
                    fontSize: 13,
                    color: s.status === "AC" ? "var(--sage-dark)" : s.score > 0 ? "var(--amber-dark)" : "var(--clay)",
                  }}>
                    {s.score}
                  </td>
                  <td className="mono muted" style={{ fontSize: 12 }}>
                    {s.execution_time ? `${s.execution_time.toFixed(2)}s` : "—"}
                  </td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{lang}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>
                    <RelativeTime date={s.created_at} />
                  </td>
                  <td><IconChevronRight size={14} style={{ color: "var(--muted)" }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            No submissions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
