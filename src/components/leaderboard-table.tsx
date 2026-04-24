"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { IconCrown, IconMedal, IconRibbon, IconTrophyMug } from "@/components/icons";

type Layout = "grid" | "podium" | "list";

const ROASTS = ["Single Origin","Espresso","Pour Over","Cold Brew","Aeropress","French Press","Chemex","Moka Pot","Cortado"];
const ORIGINS = ["Tokyo","Seoul","Berlin","London","Sydney","Lagos","Paris","NYC","Singapore"];

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
  const [layout, setLayout] = useState<Layout>("grid");

  if (rows.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 14, padding: "48px 24px", textAlign: "center",
        color: "var(--muted)", fontSize: 14, fontFamily: "var(--mono)",
      }}>
        No entries yet. Be the first!
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-sub">the regulars · all-time</div>
          <h1 className="page-title">Hall of Fame</h1>
          <p className="page-intro">Rankings by total score. Ties broken by problems solved.</p>
        </div>
        <div>
          <div className="kicker" style={{ marginBottom: 6, textAlign: "right" }}>layout</div>
          <div className="row gap-2">
            {([["grid","Coffee cards"],["podium","Podium"],["list","Ledger"]] as [Layout,string][]).map(([k,v]) => (
              <button key={k} className={`tweak-opt ${layout === k ? "active" : ""}`} onClick={() => setLayout(k)}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {layout === "grid"   && <CoffeeCardGrid rows={rows} />}
      {layout === "podium" && <Podium rows={rows} />}
      {layout === "list"   && <Ledger rows={rows} />}
    </div>
  );
}

function CoffeeCardGrid({ rows }: { rows: Profile[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {rows.map((p, i) => {
        const rank = i + 1;
        const medal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";
        const roast = ROASTS[i % ROASTS.length];
        const origin = ORIGINS[i % ORIGINS.length];
        const initial = p.username?.[0]?.toUpperCase() ?? "?";
        return (
          <div key={p.id} className={`coffee-card ${medal}`}>
            <div className="row items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="kicker">{roast}</div>
              <span className="rank-badge">#{rank}</span>
            </div>
            <div className="row items-center gap-3" style={{ marginBottom: 16 }}>
              <div className="mug" style={{ position: "relative" }}>
                {rank === 1 && <IconCrown size={14} style={{ position: "absolute", top: -8, right: -4, color: "var(--amber-dark)" }} />}
                {rank === 2 && <IconMedal size={14} style={{ position: "absolute", top: -8, right: -4, color: "#7A7261" }} />}
                {rank === 3 && <IconRibbon size={14} style={{ position: "absolute", top: -8, right: -4, color: "#8C5A3E" }} />}
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{p.username}</div>
                <div className="mono muted" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {origin} · {p.solved_count} solved
                </div>
              </div>
            </div>
            <div className="divider-dashed" style={{ margin: "16px 0 12px" }} />
            <div className="row justify-between mono" style={{ fontSize: 11 }}>
              <span className="muted">SOLVED</span>
              <span style={{ color: "var(--ink)" }}>{p.solved_count}</span>
            </div>
            <div className="row justify-between mono" style={{ fontSize: 11, marginTop: 4 }}>
              <span className="muted">TOTAL SCORE</span>
              <span style={{ color: "var(--ink)" }}>{p.total_score}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Podium({ rows }: { rows: Profile[] }) {
  const [first, second, third, ...rest] = rows;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr 1fr", gap: 24, alignItems: "end", marginBottom: 40 }}>
        {second && <PodiumCard p={second} rank={2} height={210} tone="silver" place="02" />}
        {first  && <PodiumCard p={first}  rank={1} height={260} tone="gold"   place="01" big />}
        {third  && <PodiumCard p={third}  rank={3} height={180} tone="bronze" place="03" />}
      </div>
      {rest.length > 0 && (
        <div className="card">
          {rest.map((p, i) => (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "60px 56px 1fr 120px 120px",
              alignItems: "center", padding: "18px 24px", gap: 18,
              borderBottom: i < rest.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <span className="serif" style={{ fontSize: 26, color: "var(--muted)" }}>#{i + 4}</span>
              <div className="mug" style={{ width: 44, height: 44, fontSize: 18 }}>{p.username?.[0]?.toUpperCase()}</div>
              <div>
                <div className="serif" style={{ fontSize: 18 }}>{p.username}</div>
                <div className="mono muted" style={{ fontSize: 11 }}>{ORIGINS[i % ORIGINS.length]}</div>
              </div>
              <div className="mono" style={{ fontSize: 12 }}><span className="muted">solved </span>{p.solved_count}</div>
              <div className="mono" style={{ fontSize: 12 }}><span className="muted">score </span>{p.total_score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PodiumCard({ p, rank, height, tone, place, big }: {
  p: Profile; rank: number; height: number; tone: string; place: string; big?: boolean;
}) {
  const toneColor = tone === "gold" ? "var(--amber)" : tone === "silver" ? "#A69F8A" : "#B58862";
  const initial = p.username?.[0]?.toUpperCase() ?? "?";
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mug" style={{
        width: big ? 88 : 66, height: big ? 88 : 66, fontSize: big ? 36 : 26,
        margin: "0 auto 14px",
        boxShadow: `0 0 0 2px ${toneColor}, 0 0 0 4px var(--surface), 0 0 0 5px var(--kraft-2)`,
      }}>{initial}</div>
      <div className="serif" style={{ fontSize: big ? 26 : 22, lineHeight: 1.1 }}>{p.username}</div>
      <div className="mono muted" style={{ fontSize: 11, marginTop: 4 }}>#{rank}</div>
      <div style={{
        marginTop: 16, height,
        borderRadius: "var(--r-lg)",
        background: "var(--bg-warm)",
        border: "1px solid var(--kraft-2)",
        borderTop: `3px solid ${toneColor}`,
        padding: "18px 16px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div className="serif" style={{ fontSize: big ? 52 : 44, lineHeight: 1, color: "var(--ink)" }}>{place}</div>
        <div>
          <div className="kicker" style={{ marginBottom: 3 }}>{ROASTS[rank - 1]}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {p.solved_count} solved · {p.total_score} pts
          </div>
        </div>
      </div>
    </div>
  );
}

function Ledger({ rows }: { rows: Profile[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 28px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="kicker">the ledger · live rankings</div>
        <span className="mono muted" style={{ fontSize: 11 }}>{rows.length} regulars</span>
      </div>
      {rows.map((p, i) => {
        const rank = i + 1;
        const movement = rank <= 3 ? 0 : [+1, -1, 0, +2][rank % 4];
        return (
          <div key={p.id} style={{
            display: "grid", gridTemplateColumns: "50px 44px 1fr 100px 80px 80px",
            alignItems: "center", gap: 20, padding: "18px 28px",
            borderBottom: "1px solid var(--line-soft)",
          }}>
            <div className="serif" style={{ fontSize: 26, color: rank <= 3 ? "var(--ink)" : "var(--muted)" }}>#{rank}</div>
            <div className="mug" style={{ width: 38, height: 38, fontSize: 16 }}>{p.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="serif" style={{ fontSize: 18 }}>{p.username}</div>
              <div className="mono muted" style={{ fontSize: 11 }}>{ROASTS[i % ROASTS.length]} · {ORIGINS[i % ORIGINS.length]}</div>
            </div>
            <div className="mono" style={{ fontSize: 13 }}>{p.solved_count}<span className="muted" style={{ fontSize: 11 }}> solved</span></div>
            <div className="mono" style={{ fontSize: 13 }}>{p.total_score}<span className="muted" style={{ fontSize: 11 }}> pts</span></div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--mono)", fontSize: 11,
              color: movement > 0 ? "var(--sage-dark)" : movement < 0 ? "var(--clay)" : "var(--muted)",
            }}>
              {movement > 0 ? "▲" : movement < 0 ? "▼" : "—"}
              {movement !== 0 && <span>{Math.abs(movement)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
