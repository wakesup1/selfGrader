"use client";

import { useState } from "react";
import Link from "next/link";
import { RelativeTime } from "@/components/relative-time";
import { STATUS_LABEL } from "@/lib/utils";
import { JUDGE0_LANGUAGE_MAP } from "@/lib/constants";

type Submission = {
  id: number;
  problem_id: number;
  language_id: number;
  status: string;
  score: number;
  created_at: string;
  problems: { title: string } | null;
};

type Props = {
  username: string;
  solvedCount: number;
  totalScore: number;
  isAdmin: boolean;
  joinedAt: string;
  submissions: Submission[];
  isOwnProfile: boolean;
};

const statusChip: Record<string, { bg: string; color: string; border: string }> = {
  AC:  { bg: "var(--sage-bg)",  color: "#5C7558",           border: "#CFD9C7" },
  WA:  { bg: "var(--clay-bg)",  color: "#8C4B42",           border: "#E3C4BE" },
  TLE: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  CE:  { bg: "#EDE8F5",         color: "#6B4E9E",           border: "#D3C6E8" },
  RE:  { bg: "#FEF0E6",         color: "#934B1E",           border: "#F0CDB0" },
};

function Heatmap() {
  const cells = Array.from({ length: 12 * 7 }, (_, i) => {
    const seed = (i * 37) % 11;
    return seed > 7 ? 1 : seed > 5 ? 0.78 : seed > 3 ? 0.55 : seed > 1 ? 0.35 : seed > 0 ? 0.15 : 0;
  });
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gridTemplateRows: "repeat(7, 14px)",
      gridAutoFlow: "column",
      gap: 4,
    }}>
      {cells.map((v, i) => (
        <div key={i} style={{
          background: v === 0 ? "var(--bg-warm)" : `rgba(122,134,108,${v})`,
          borderRadius: 2,
        }} />
      ))}
    </div>
  );
}

type Tab = "regular" | "activity";

export function ProfileView({
  username,
  solvedCount,
  totalScore,
  isAdmin,
  joinedAt,
  submissions,
  isOwnProfile,
}: Props) {
  const [tab, setTab] = useState<Tab>("regular");
  const initial = username[0].toUpperCase();

  const stats = [
    { label: "problems brewed", value: String(solvedCount), hint: "all-time" },
    { label: "total score",     value: String(totalScore),  hint: "across all problems" },
    { label: "submissions",     value: String(submissions.length), hint: "shown here" },
    { label: "status",          value: isAdmin ? "Admin" : "Regular", hint: isAdmin ? "staff only" : "member" },
  ];

  return (
    <div>
      {/* Profile header */}
      <div className="card" style={{
        padding: 36, marginBottom: 28,
        background: "linear-gradient(180deg, var(--bg-warm) 0%, var(--surface) 100%)",
      }}>
        <div className="row gap-5 items-start">
          <div className="av" style={{ width: 88, height: 88, fontSize: 34, background: "linear-gradient(135deg, var(--amber), var(--sage))", color: "white", border: "3px solid var(--surface)", boxShadow: "0 0 0 1px var(--kraft-2)" }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>regular since <RelativeTime date={joinedAt} /></div>
            <h1 className="serif" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.02em", margin: 0 }}>
              {username}
            </h1>
            <div className="row gap-3 items-center" style={{ marginTop: 10 }}>
              {isAdmin && (
                <span className="role-badge admin">Admin</span>
              )}
            </div>
          </div>
          <div className="row gap-2">
            {isOwnProfile && (
              <Link href="/auth" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
                Settings
              </Link>
            )}
          </div>
        </div>
        <div className="divider" style={{ margin: "26px 0 22px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div className="serif" style={{ fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="kicker" style={{ marginTop: 8 }}>{s.label}</div>
              <div className="mono muted" style={{ fontSize: 10.5, marginTop: 2 }}>{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 24 }}>
        {([["regular", "The regular"], ["activity", "Activity"]] as [Tab, string][]).map(([k, v]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>
            {v}
          </button>
        ))}
      </div>

      {/* Regular tab — heatmap */}
      {tab === "regular" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className="kicker" style={{ marginBottom: 14 }}>brewing chart · last 12 weeks</div>
            <Heatmap />
            <div className="row gap-3 items-center" style={{ marginTop: 14, fontSize: 11 }}>
              <span className="mono muted">less</span>
              {[0.15, 0.35, 0.55, 0.78, 1].map((a, i) => (
                <div key={i} style={{ width: 12, height: 12, background: `rgba(122,134,108,${a})`, borderRadius: 2 }} />
              ))}
              <span className="mono muted">more</span>
              <span className="mono muted" style={{ marginLeft: "auto" }}>{solvedCount} brews</span>
            </div>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <div className="kicker" style={{ marginBottom: 14 }}>recent submissions</div>
            {submissions.length === 0 ? (
              <div className="mono muted" style={{ fontSize: 13, padding: "24px 0", textAlign: "center" }}>
                No submissions yet — pour your first cup.
              </div>
            ) : (
              <div className="col gap-2">
                {submissions.slice(0, 5).map((s) => (
                  <Link key={s.id} href={`/submissions/${s.id}`} style={{ textDecoration: "none" }}>
                    <div className="list-row" style={{ gridTemplateColumns: "1fr auto", cursor: "pointer" }}>
                      <div>
                        <div className="serif" style={{ fontSize: 15 }}>
                          {s.problems?.title ?? `Problem ${s.problem_id}`}
                        </div>
                        <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                          {JUDGE0_LANGUAGE_MAP[s.language_id as 54 | 62 | 71]?.label ?? s.language_id}
                        </div>
                      </div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 9px", borderRadius: 999,
                        fontFamily: "var(--mono)", fontSize: 10.5,
                        ...(statusChip[s.status] ?? { bg: "var(--bg-warm)", color: "var(--muted)", border: "var(--kraft-2)" }),
                        background: (statusChip[s.status] ?? { bg: "var(--bg-warm)" }).bg,
                        color:      (statusChip[s.status] ?? { color: "var(--muted)" }).color,
                        border:     `1px solid ${(statusChip[s.status] ?? { border: "var(--kraft-2)" }).border}`,
                      }}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity tab — full submissions list */}
      {tab === "activity" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="section-head">
            <div>
              <div className="kicker">submission history</div>
              <div className="serif" style={{ fontSize: 20, marginTop: 4 }}>Recent submissions</div>
            </div>
            <Link href="/submissions" className="mono" style={{ fontSize: 11, color: "var(--clay)", textDecoration: "none" }}>
              view all →
            </Link>
          </div>
          {submissions.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)" }}>
              No submissions yet.
            </div>
          ) : (
            submissions.map((s) => (
              <Link key={s.id} href={`/submissions/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="list-row" style={{ gridTemplateColumns: "100px 1fr 120px 80px 130px", cursor: "pointer" }}>
                  <span className="mono muted" style={{ fontSize: 12 }}>#{s.id}</span>
                  <div>
                    <div className="serif" style={{ fontSize: 16 }}>{s.problems?.title ?? `Problem ${s.problem_id}`}</div>
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {JUDGE0_LANGUAGE_MAP[s.language_id as 54 | 62 | 71]?.label ?? s.language_id}
                    </div>
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 999,
                    fontFamily: "var(--mono)", fontSize: 10.5,
                    background: (statusChip[s.status] ?? { bg: "var(--bg-warm)" }).bg,
                    color:      (statusChip[s.status] ?? { color: "var(--muted)" }).color,
                    border:     `1px solid ${(statusChip[s.status] ?? { border: "var(--kraft-2)" }).border}`,
                  }}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  <span className="mono" style={{
                    fontSize: 13,
                    color: s.status === "AC" ? "#5C7558" : s.score > 0 ? "var(--amber-dark)" : "var(--clay)",
                  }}>
                    {s.score}
                  </span>
                  <span className="mono muted" style={{ fontSize: 11 }}>
                    <RelativeTime date={s.created_at} />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
