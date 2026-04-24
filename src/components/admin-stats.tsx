"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  StatsOverview,
  StatsProblem,
  StatsDistribution,
  StatsTestcaseRates,
  StatsCohortStudent,
  StatsTrend,
} from "@/services/stats";

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// ── Time ago helper ────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 24, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--kraft-2)", opacity: 0.6,
      animation: "skeleton-pulse 1.4s ease-in-out infinite",
    }} />
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function Progress({ value, tone }: { value: number; tone: "sage" | "amber" | "clay" }) {
  const color = tone === "sage" ? "var(--sage-dark)" : tone === "amber" ? "var(--amber-dark)" : "var(--clay)";
  const bg    = tone === "sage" ? "var(--sage-bg)"   : tone === "amber" ? "var(--amber-bg)"   : "var(--clay-bg)";
  return (
    <div style={{ height: 5, borderRadius: 999, background: bg, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ── Overview strip ─────────────────────────────────────────────────────────────

function OverviewCell({
  label, value, unit, tone, last, loading,
}: {
  label: string; value: string | number; unit: string;
  tone?: "sage" | "clay" | "amber"; last?: boolean; loading?: boolean;
}) {
  const color = tone === "sage" ? "var(--sage-dark)" : tone === "clay" ? "var(--clay)" : tone === "amber" ? "var(--amber-dark)" : "var(--ink)";
  return (
    <div style={{ padding: "22px 26px", borderRight: last ? "none" : "1px solid var(--line-soft)" }}>
      <div className="kicker">{label}</div>
      {loading ? (
        <div style={{ marginTop: 10, marginBottom: 8 }}><Skeleton h={36} w="60%" /></div>
      ) : (
        <div className="serif" style={{ fontSize: 38, lineHeight: 1.05, color, marginTop: 6 }}>{value}</div>
      )}
      <div className="mono muted" style={{ fontSize: 11, marginTop: 4 }}>{unit}</div>
    </div>
  );
}

// ── Legend swatch ──────────────────────────────────────────────────────────────

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span className="mono muted" style={{ fontSize: 11 }}>{label}</span>
    </div>
  );
}

// ── Mini stat (used in histogram header) ──────────────────────────────────────

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone?: "sage" | "clay" }) {
  const color = tone === "sage" ? "var(--sage-dark)" : tone === "clay" ? "var(--clay)" : "var(--ink)";
  return (
    <div style={{ textAlign: "right" }}>
      <div className="kicker" style={{ fontSize: 9.5 }}>{label}</div>
      <div className="serif" style={{ fontSize: 24, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

// ── Histogram card ─────────────────────────────────────────────────────────────

function HistogramCard({ dist, loading }: { dist: StatsDistribution | null; loading: boolean }) {
  if (loading || !dist) {
    return (
      <div className="card" style={{ padding: 26 }}>
        <Skeleton h={20} w="60%" />
        <div style={{ marginTop: 12 }}><Skeleton h={240} /></div>
      </div>
    );
  }

  const counts = dist.buckets.map((b) => b.count);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="card" style={{ padding: 26 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div className="kicker">score distribution</div>
          <div className="serif" style={{ fontSize: 24, marginTop: 4 }}>How the class scored</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <MiniStat label="Avg" value={dist.avgScore} />
          <MiniStat label="100s" value={dist.fullMarks} tone="sage" />
          <MiniStat label="Zeros" value={dist.zeros} tone="clay" />
        </div>
      </div>

      <svg viewBox="0 0 620 240" width="100%" height="240" style={{ overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="40" x2="610" y1={210 - t * 180} y2={210 - t * 180}
            stroke="var(--line-soft)" strokeDasharray="3 4" />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x="32" y={210 - t * 180 + 4} textAnchor="end"
            fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">
            {Math.round(maxCount * t)}
          </text>
        ))}
        {counts.map((v, i) => {
          const w = 46;
          const x = 50 + i * 52;
          const h = (v / maxCount) * 180;
          const y = 210 - h;
          const fill = i === 0 ? "var(--clay)" : i <= 4 ? "var(--amber)" : i <= 9 ? "var(--sage)" : "var(--sage-dark)";
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={Math.max(h, 1)} rx="3" fill={fill} opacity="0.92" />
              {v > 0 && (
                <text x={x + w / 2} y={y - 6} textAnchor="middle"
                  fontFamily="var(--mono)" fontSize="10.5" fill="var(--ink)" fontWeight="500">{v}</text>
              )}
              <text x={x + w / 2} y="228" textAnchor="middle"
                fontFamily="var(--mono)" fontSize="9.5" fill="var(--muted)">
                {dist.buckets[i].label}
              </text>
            </g>
          );
        })}
        <line x1="40" x2="610" y1="210" y2="210" stroke="var(--ink)" strokeWidth="1" />
      </svg>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: "1px dashed var(--kraft-2)" }}>
        <LegendSwatch color="var(--clay)" label="Burnt (0)" />
        <LegendSwatch color="var(--amber)" label="Steeping (1–50)" />
        <LegendSwatch color="var(--sage)" label="Nearly brewed (51–99)" />
        <LegendSwatch color="var(--sage-dark)" label="Perfect pour (100)" />
        <div style={{ flex: 1 }} />
        <span className="mono muted" style={{ fontSize: 11 }}>n = {dist.n}</span>
      </div>
    </div>
  );
}

// ── Testcase heatmap card ──────────────────────────────────────────────────────

function TestcaseCard({ tc, loading }: { tc: StatsTestcaseRates | null; loading: boolean }) {
  if (loading || !tc) {
    return (
      <div className="card" style={{ padding: 26 }}>
        <Skeleton h={20} w="50%" />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={30} />)}
        </div>
      </div>
    );
  }

  if (tc.testcaseCount === 0) {
    return (
      <div className="card" style={{ padding: 26 }}>
        <div className="kicker">testcase pass rate</div>
        <div className="serif" style={{ fontSize: 24, marginTop: 4 }}>Where it burns</div>
        <div className="mono muted" style={{ fontSize: 12, marginTop: 20 }}>No testcases recorded yet.</div>
      </div>
    );
  }

  const overall = tc.rates.reduce((s, v) => s + v, 0) / tc.rates.length * 100;

  return (
    <div className="card" style={{ padding: 26 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="kicker">testcase pass rate</div>
        <div className="serif" style={{ fontSize: 24, marginTop: 4 }}>Where it burns</div>
        <div className="mono muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          Each bar = % of submissions that passed this testcase.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tc.rates.map((rate, i) => {
          const pct = Math.round(rate * 100);
          const tone: "sage" | "amber" | "clay" = rate >= 0.75 ? "sage" : rate >= 0.4 ? "amber" : "clay";
          const bgColor  = tone === "sage" ? "var(--sage-bg)"   : tone === "amber" ? "var(--amber-bg)"   : "var(--clay-bg)";
          const barColor = tone === "sage" ? "var(--sage-dark)" : tone === "amber" ? "var(--amber-dark)" : "var(--clay)";
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 52px",
              gap: 12, alignItems: "center", padding: "6px 10px",
              borderRadius: "var(--r)",
              background: i % 2 === 0 ? "transparent" : "var(--bg)",
            }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                tc {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ position: "relative", height: 18, background: bgColor, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width 0.6s cubic-bezier(.2,.8,.2,1)" }} />
              </div>
              <span className="mono" style={{ fontSize: 12, textAlign: "right", color: barColor, fontWeight: 500 }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--kraft-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono muted" style={{ fontSize: 11 }}>overall pass rate</span>
        <span className="serif" style={{ fontSize: 22 }}>
          {overall.toFixed(1)}<span className="mono muted" style={{ fontSize: 12, marginLeft: 4 }}>%</span>
        </span>
      </div>
    </div>
  );
}

// ── Scatter card ───────────────────────────────────────────────────────────────

function ScatterCard({ cohort, loading }: { cohort: StatsCohortStudent[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 26, marginBottom: 28 }}>
        <Skeleton h={20} w="50%" />
        <div style={{ marginTop: 12 }}><Skeleton h={360} /></div>
      </div>
    );
  }

  const xMax = Math.max(60, ...cohort.map((c) => c.submissionCount));

  return (
    <div className="card" style={{ padding: 26, marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="kicker">per-student · effort vs result</div>
          <div className="serif" style={{ fontSize: 24, marginTop: 4 }}>Who&apos;s steeping, who&apos;s scorched</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <LegendSwatch color="var(--sage-dark)" label="≥ 85 avg" />
          <LegendSwatch color="var(--amber-dark)" label="60 – 85" />
          <LegendSwatch color="var(--clay)" label="< 60" />
        </div>
      </div>

      {cohort.length === 0 ? (
        <div className="mono muted" style={{ fontSize: 13, textAlign: "center", padding: "60px 0" }}>No submissions yet.</div>
      ) : (
        <svg viewBox="0 0 1200 360" width="100%" height="360" style={{ overflow: "visible" }}>
          <line x1="60" x2="1170" y1="320" y2="320" stroke="var(--ink)" strokeWidth="1" />
          <line x1="60" x2="60" y1="30" y2="320" stroke="var(--ink)" strokeWidth="1" />

          {[0, 25, 50, 75, 100].map((v) => {
            const y = 320 - (v / 100) * 290;
            return (
              <g key={v}>
                <line x1="60" x2="1170" y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray="3 4" />
                <text x="52" y={y + 4} textAnchor="end" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">{v}</text>
              </g>
            );
          })}

          {/* at-risk threshold */}
          <line x1="60" x2="1170" y1={320 - (60 / 100) * 290} y2={320 - (60 / 100) * 290}
            stroke="var(--clay)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="1165" y={320 - (60 / 100) * 290 - 6} textAnchor="end"
            fontFamily="var(--mono)" fontSize="10" fill="var(--clay)">at-risk</text>

          {[0, Math.round(xMax * 0.25), Math.round(xMax * 0.5), Math.round(xMax * 0.75), xMax].map((v) => (
            <text key={v} x={60 + (v / xMax) * 1110} y="338" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">{v}</text>
          ))}

          <text x="615" y="356" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.15em">
            SUBMISSIONS →
          </text>
          <text x="20" y="175" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.15em"
            transform="rotate(-90 20 175)">↑ AVG SCORE</text>

          {cohort.map((c) => {
            const x = 60 + (c.submissionCount / xMax) * 1110;
            const y = 320 - (c.avgScore / 100) * 290;
            const color = c.avgScore >= 85 ? "var(--sage-dark)" : c.avgScore >= 60 ? "var(--amber-dark)" : "var(--clay)";
            return (
              <g key={c.userId}>
                <circle cx={x} cy={y} r="7" fill={color} opacity="0.85" />
                <circle cx={x} cy={y} r="7" fill="none" stroke="var(--surface)" strokeWidth="1.5" />
                <text x={x + 10} y={y + 3} fontFamily="var(--mono)" fontSize="9.5" fill="var(--ink-soft)">
                  {c.handle.length > 12 ? c.handle.slice(0, 12) : c.handle}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ── Cohort table ───────────────────────────────────────────────────────────────

type SortKey = "name" | "avgScore" | "submissionCount" | "lastSubmittedAt";

function CohortTable({ cohort, loading }: { cohort: StatsCohortStudent[]; loading: boolean }) {
  const [sortBy, setSortBy] = useState<SortKey>("avgScore");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const toggle = (k: SortKey) => {
    if (sortBy === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setDir("desc"); }
  };

  const sorted = [...cohort].sort((a, b) => {
    const av = a[sortBy] as string | number | null;
    const bv = b[sortBy] as string | number | null;
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const Col = ({ k, label, w }: { k: SortKey; label: string; w?: number }) => (
    <th style={{ width: w, cursor: "pointer", userSelect: "none" }} onClick={() => toggle(k)}>
      {label}
      {sortBy === k && <span style={{ marginLeft: 6, color: "var(--ink)" }}>{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="kicker">the roster</div>
          <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>
            All students · {loading ? "…" : `${sorted.length} brewing`}
          </div>
        </div>
        <div className="mono muted" style={{ fontSize: 11 }}>click column header to sort</div>
      </div>

      {loading ? (
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={44} />)}
        </div>
      ) : (
        <table className="problems-table">
          <thead>
            <tr>
              <Col k="name" label="Student" />
              <Col k="avgScore" label="Avg score" w={180} />
              <Col k="submissionCount" label="Submissions" w={140} />
              <Col k="lastSubmittedAt" label="Last brew" w={130} />
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const tone: "sage" | "amber" | "clay" = c.avgScore >= 85 ? "sage" : c.avgScore >= 60 ? "amber" : "clay";
              return (
                <tr key={c.userId}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "var(--bg-warm)", color: "var(--ink-soft)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--serif)", fontSize: 13,
                        border: "1px solid var(--kraft-2)", flexShrink: 0,
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="serif" style={{ fontSize: 17, lineHeight: 1.2 }}>{c.name}</div>
                        <div className="mono muted" style={{ fontSize: 11, marginTop: 1 }}>{c.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ width: 140 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span className="mono" style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>
                          {c.avgScore.toFixed(1)}
                        </span>
                        <span className="mono muted" style={{ fontSize: 11 }}>/ 100</span>
                      </div>
                      <Progress value={c.avgScore} tone={tone} />
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12.5, color: "var(--ink)" }}>{c.submissionCount}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{timeAgo(c.lastSubmittedAt)} ago</td>
                  <td>
                    <button className="btn btn-ghost btn-sm">View →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Trend card ─────────────────────────────────────────────────────────────────

function TrendCard({ trend, loading }: { trend: StatsTrend | null; loading: boolean }) {
  if (loading || !trend) {
    return (
      <div className="card" style={{ padding: 26, marginBottom: 28 }}>
        <Skeleton h={20} w="40%" />
        <div style={{ marginTop: 12 }}><Skeleton h={260} /></div>
      </div>
    );
  }

  const { points } = trend;
  const maxSub = Math.max(1, ...points.map((d) => d.submissionCount));
  const W = 1140, H = 260, pad = { t: 30, r: 50, b: 40, l: 50 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const days = points.length;

  const linePts = points.map((d, i) => [
    pad.l + (i / Math.max(days - 1, 1)) * chartW,
    pad.t + (1 - d.avgScore / 100) * chartH,
  ] as [number, number]);
  const linePath = linePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <div className="card" style={{ padding: 26, marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="kicker">past {days} days</div>
          <div className="serif" style={{ fontSize: 24, marginTop: 4 }}>Daily brewing trend</div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--kraft-2)" }} />
            <span className="mono muted" style={{ fontSize: 11 }}>submissions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 2, background: "var(--sage-dark)", display: "block" }} />
            <span className="mono muted" style={{ fontSize: 11 }}>avg score</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: "visible" }}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad.t + (1 - v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray="3 4" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">{v}</text>
            </g>
          );
        })}

        {points.map((d, i) => {
          const x = pad.l + (i / Math.max(days - 1, 1)) * chartW - 14;
          const hNorm = (d.submissionCount / maxSub) * chartH * 0.85;
          const y = pad.t + chartH - hNorm;
          return (
            <g key={i}>
              <rect x={x} y={y} width="28" height={Math.max(hNorm, 1)} fill="var(--kraft-2)" rx="3" opacity="0.8" />
              <text x={x + 14} y={H - pad.b + 16} textAnchor="middle"
                fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">
                {i === days - 1 ? "today" : `-${days - 1 - i}`}
              </text>
            </g>
          );
        })}

        {days > 1 && (
          <>
            <path d={linePath} fill="none" stroke="var(--sage-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {linePts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill="var(--surface)" stroke="var(--sage-dark)" strokeWidth="1.5" />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

// ── Problem picker strip ───────────────────────────────────────────────────────

function ProblemPicker({
  problems, selectedId, onSelect, loading,
}: {
  problems: StatsProblem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
}) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 28, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="kicker">per-problem breakdown</div>
            <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Pick a problem to inspect</div>
          </div>
          <div className="mono muted" style={{ fontSize: 12 }}>
            {loading ? "loading…" : `${problems.length} problems`}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 0, padding: "16px 24px", overflowX: "auto" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ minWidth: 168, padding: "0 12px 0 0" }}><Skeleton h={64} /></div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "1px solid var(--line-soft)" }}>
          {problems.map((p) => {
            const active = p.id === selectedId;
            const tone: "sage" | "amber" | "clay" = p.avgScore >= 75 ? "sage" : p.avgScore >= 50 ? "amber" : "clay";
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                style={{
                  flex: "1 0 auto", minWidth: 168, padding: "16px 20px",
                  textAlign: "left", borderRight: "1px solid var(--line-soft)",
                  background: active ? "var(--bg-warm)" : "transparent",
                  borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
                  transition: "all 0.15s", cursor: "pointer",
                }}
              >
                <div className="mono muted" style={{ fontSize: 10.5, letterSpacing: "0.12em" }}>
                  #{p.id}
                </div>
                <div className="serif" style={{ fontSize: 16, lineHeight: 1.2, margin: "3px 0 8px" }}>
                  {p.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 16, color: "var(--ink)", fontWeight: 500 }}>
                    {p.avgScore}
                  </span>
                  <span className="mono muted" style={{ fontSize: 10.5 }}>avg</span>
                  <div style={{ flex: 1, marginLeft: 4 }}>
                    <Progress value={p.avgScore} tone={tone} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main AdminStats component ──────────────────────────────────────────────────

export function AdminStats() {
  const [overview, setOverview]   = useState<StatsOverview | null>(null);
  const [problems, setProblems]   = useState<StatsProblem[]>([]);
  const [cohort, setCohort]       = useState<StatsCohortStudent[]>([]);
  const [trend, setTrend]         = useState<StatsTrend | null>(null);
  const [dist, setDist]           = useState<StatsDistribution | null>(null);
  const [tc, setTc]               = useState<StatsTestcaseRates | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  // Fetch main data (overview + problems + cohort + trend) in parallel
  useEffect(() => {
    setLoadingMain(true);
    Promise.all([
      apiFetch<StatsOverview>("/api/admin/stats/overview"),
      apiFetch<StatsProblem[]>("/api/admin/stats/problems"),
      apiFetch<StatsCohortStudent[]>("/api/admin/stats/cohort"),
      apiFetch<StatsTrend>("/api/admin/stats/trend?days=14"),
    ])
      .then(([ov, probs, coh, tr]) => {
        setOverview(ov);
        setProblems(probs);
        setCohort(coh);
        setTrend(tr);
        if (probs.length > 0) setSelectedId(probs[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMain(false));
  }, []);

  // Fetch per-problem detail (distribution + testcase rates) when selection changes
  const fetchDetail = useCallback((id: number) => {
    setLoadingDetail(true);
    setDist(null);
    setTc(null);
    Promise.all([
      apiFetch<StatsDistribution>(`/api/admin/stats/problems/${id}/distribution`),
      apiFetch<StatsTestcaseRates>(`/api/admin/stats/problems/${id}/testcase-rates`),
    ])
      .then(([d, t]) => { setDist(d); setTc(t); })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingDetail(false));
  }, []);

  useEffect(() => {
    if (selectedId !== null) fetchDetail(selectedId);
  }, [selectedId, fetchDetail]);

  function handleExportCsv() {
    window.open("/api/admin/stats/export", "_blank");
  }

  return (
    <div>
      {/* ── Page head ── */}
      <div className="page-head">
        <div>
          <div className="page-sub">admin · the roaster&apos;s ledger</div>
          <h1 className="page-title">Statistics</h1>
          <p className="page-intro">
            How the class is brewing. Per-problem score distributions, testcase pain points,
            and individual performance — everything the grader sees, laid out flat.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-ghost btn-sm" onClick={handleExportCsv}>
            <span className="mono">↓</span> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: "12px 18px", background: "var(--clay-bg)", border: "1px solid #E3C4BE", borderRadius: "var(--r)", fontSize: 13, color: "#8C4B42" }}>
          {error}
        </div>
      )}

      {/* ── Overview strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginBottom: 28,
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)", overflow: "hidden",
      }}>
        <OverviewCell label="Class average"  value={overview?.classAverage ?? "—"}  unit="/ 100"       tone="sage"  loading={loadingMain} />
        <OverviewCell label="Students"       value={overview?.studentsEnrolled ?? "—"} unit="enrolled"               loading={loadingMain} />
        <OverviewCell label="Submissions"    value={overview ? overview.totalSubmissions.toLocaleString() : "—"} unit="this term" loading={loadingMain} />
        <OverviewCell label="At risk"        value={overview?.atRiskCount ?? "—"}    unit="< 60 avg"   tone="clay"  loading={loadingMain} />
        <OverviewCell label="Star students"  value={overview?.starStudentCount ?? "—"} unit="≥ 90 avg" tone="amber" loading={loadingMain} last />
      </div>

      {/* ── Problem picker ── */}
      <ProblemPicker
        problems={problems}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        loading={loadingMain}
      />

      {/* ── Histogram + Testcase heatmap ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 24, marginBottom: 28 }}>
        <HistogramCard dist={dist} loading={loadingDetail || (loadingMain && !dist)} />
        <TestcaseCard  tc={tc}    loading={loadingDetail || (loadingMain && !tc)} />
      </div>

      {/* ── Scatter ── */}
      <ScatterCard cohort={cohort} loading={loadingMain} />

      {/* ── Cohort table ── */}
      <CohortTable cohort={cohort} loading={loadingMain} />

      {/* ── Trend chart ── */}
      <TrendCard trend={trend} loading={loadingMain} />
    </div>
  );
}
