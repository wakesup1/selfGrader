import Link from "next/link";
import type { Profile } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
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
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "56px 1fr 100px 80px",
        gap: 12, padding: "12px 24px",
        borderBottom: "1px solid var(--line)",
        fontFamily: "var(--mono)", fontSize: 10.5,
        letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)",
      }}>
        <span>Rank</span>
        <span>Name</span>
        <span style={{ textAlign: "right" }}>Score</span>
        <span style={{ textAlign: "right" }}>Solved</span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const rank = i + 1;
        const isTop = rank <= 3;
        const initial = row.username ? row.username[0].toUpperCase() : "?";

        return (
          <div
            key={row.id}
            style={{
              display: "grid", gridTemplateColumns: "56px 1fr 100px 80px",
              gap: 12, padding: "16px 24px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid var(--line-soft)" : "none",
              background: rank === 1 ? "linear-gradient(to right, var(--amber-bg), transparent)" : undefined,
            }}
          >
            {/* Rank */}
            <span style={{
              fontFamily: "var(--serif)", fontSize: isTop ? 22 : 16,
              color: isTop ? "var(--amber-dark)" : "var(--muted-2)",
              letterSpacing: "-0.03em",
            }}>
              {isTop ? MEDALS[i] : rank}
            </span>

            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--amber), var(--sage))",
                display: "grid", placeItems: "center",
                color: "white", fontSize: 14, fontWeight: 600,
                fontFamily: "var(--serif)",
                flexShrink: 0,
              }}>
                {initial}
              </div>
              <Link
                href={`/profile/${encodeURIComponent(row.username)}`}
                style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)", textDecoration: "none" }}
                className="problem-row-hover-text"
              >
                {row.username}
              </Link>
            </div>

            {/* Score */}
            <span style={{
              fontFamily: "var(--mono)", fontSize: 14,
              fontWeight: isTop ? 600 : 400,
              color: "var(--clay)", textAlign: "right",
            }}>
              {row.total_score}
            </span>

            {/* Solved */}
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)", textAlign: "right" }}>
              {row.solved_count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
