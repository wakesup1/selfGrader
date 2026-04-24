"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconRoastLight, IconRoastMedium, IconRoastDark, IconBrewed, IconBurnt } from "@/components/icons";
import type { ProblemWithStat } from "@/app/page";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const diffTone: Record<string, string> = {
  Easy:   "chip-sage",
  Medium: "chip-amber",
  Hard:   "chip-clay",
};

const DiffIcon = ({ diff }: { diff: string }) => {
  if (diff === "Easy")   return <IconRoastLight size={11} />;
  if (diff === "Medium") return <IconRoastMedium size={11} />;
  if (diff === "Hard")   return <IconRoastDark size={11} />;
  return null;
};

function statusInfo(stat: ProblemWithStat["userStat"]): { dot: string; label: string; tone: "sage" | "amber" | "clay" } {
  if (!stat) return { dot: "var(--line)", label: "unattempted", tone: "clay" };
  if (stat.is_solved) return { dot: "#5C7558", label: "accepted", tone: "sage" };
  if (stat.best_score > 0) return { dot: "var(--amber)", label: "partial", tone: "amber" };
  return { dot: "var(--clay)", label: "wrong", tone: "clay" };
}

export function ProblemsTableFull({
  problems,
  isLoggedIn,
}: {
  problems: ProblemWithStat[];
  isLoggedIn: boolean;
}) {
  const [diff, setDiff] = useState("All");
  const [q, setQ] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [problems, diff, q]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid var(--line-soft)" }}>
        <div className="row items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <div className="kicker">the menu</div>
            <div className="serif" style={{ fontSize: 26, marginTop: 2 }}>Today&apos;s problems</div>
          </div>
          <div className="mono muted" style={{ fontSize: 12 }}>
            {filtered.length} of {problems.length} · fresh daily
          </div>
        </div>

        <div className="row gap-3 items-center" style={{ flexWrap: "wrap" }}>
          {/* Difficulty filters */}
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`tweak-opt ${diff === d ? "active" : ""}`}
                onClick={() => setDiff(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <input
              className="input"
              placeholder="Search problems…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 220, paddingLeft: 34, fontSize: 13, height: 38, padding: "0 14px 0 34px" }}
            />
            <IconSearch size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="problems-table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>#</th>
            <th>Problem</th>
            <th style={{ width: 110 }}>Difficulty</th>
            {isLoggedIn && <th style={{ width: 200 }}>Your brew</th>}
            <th style={{ width: 90, textAlign: "right" }}>Points</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => {
            const si = statusInfo(p.userStat);
            const scorePercent = p.userStat
              ? Math.round((p.userStat.best_score / p.points) * 100)
              : 0;

            return (
              <tr
                key={p.id}
                className="clickable"
                onClick={() => router.push(`/problems/${p.id}`)}
              >
                <td className="mono muted" style={{ fontSize: 12 }}>
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: si.dot, flexShrink: 0,
                    }} />
                    <div>
                      <div className="serif" style={{ fontSize: 19, lineHeight: 1.2 }}>{p.title}</div>
                      <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {p.time_limit}s · {p.memory_limit}MB · {p.points} pts
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`chip ${diffTone[p.difficulty] ?? ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <DiffIcon diff={p.difficulty} />
                    {p.difficulty}
                  </span>
                </td>
                {isLoggedIn && (
                  <td>
                    {!p.userStat ? (
                      <span className="muted mono" style={{ fontSize: 12 }}>— not tasted —</span>
                    ) : (
                      <div style={{ width: 160 }}>
                        <div className="row justify-between" style={{ marginBottom: 5 }}>
                          <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>
                            {p.userStat.best_score.toFixed(0)} / {p.points}
                          </span>
                          <span className="mono muted" style={{ fontSize: 11 }}>
                            {si.label}
                          </span>
                        </div>
                        <div className={`progress ${si.tone === "amber" ? "amber" : si.tone === "clay" ? "clay" : ""}`}>
                          <span style={{ width: `${scorePercent}%` }} />
                        </div>
                      </div>
                    )}
                  </td>
                )}
                <td className="mono" style={{ fontSize: 13, textAlign: "right", color: "var(--ink-soft)" }}>
                  {p.points}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); router.push(`/problems/${p.id}`); }}
                  >
                    Open →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)" }}>
          No problems match your filters.
        </div>
      )}
    </div>
  );
}
