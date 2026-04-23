import Link from "next/link";
import type { Problem } from "@/lib/types";

const difficultyChip: Record<Problem["difficulty"], { bg: string; color: string; border: string }> = {
  Easy:   { bg: "var(--sage-bg)",  color: "#5C7558",       border: "#CFD9C7" },
  Medium: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  Hard:   { bg: "var(--clay-bg)",  color: "#8C4B42",       border: "#E3C4BE" },
};

export function ProblemList({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 14, padding: "48px 24px", textAlign: "center",
        color: "var(--muted)", fontSize: 14, fontFamily: "var(--mono)",
      }}>
        No problems published yet.
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      {/* Table header */}
      <div style={{
        display: "grid", gridTemplateColumns: "48px 1fr 100px 90px",
        gap: 12, padding: "12px 20px",
        borderBottom: "1px solid var(--line)",
        fontFamily: "var(--mono)", fontSize: 10.5,
        letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)",
      }}>
        <span>#</span>
        <span>Title</span>
        <span style={{ textAlign: "right" }}>Points</span>
        <span>Difficulty</span>
      </div>

      {/* Rows */}
      {problems.map((problem, i) => {
        const chip = difficultyChip[problem.difficulty];
        return (
          <Link
            key={problem.id}
            href={`/problems/${problem.id}`}
            style={{
              display: "grid", gridTemplateColumns: "48px 1fr 100px 90px",
              gap: 12, padding: "16px 20px", alignItems: "center",
              borderBottom: i < problems.length - 1 ? "1px solid var(--line-soft)" : "none",
              textDecoration: "none", color: "inherit", transition: "background 0.1s",
            }}
            className="problem-row-hover"
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted-2)" }}>{i + 1}</span>
            <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{problem.title}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)", textAlign: "right" }}>
              {problem.points}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 10px", borderRadius: 999,
              fontFamily: "var(--mono)", fontSize: 11,
              background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
              width: "fit-content",
            }}>
              {problem.difficulty}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
