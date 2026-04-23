import Link from "next/link";
import { ArrowRight, Trophy, Code2, ScrollText } from "lucide-react";

export default function Home() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "56px 48px 80px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 56 }}>
        <div className="kicker" style={{ marginBottom: 16 }}>Online Judge Platform · Powered by Judge0</div>
        <h1 style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(44px, 6vw, 72px)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "var(--ink)",
          margin: "0 0 20px",
          maxWidth: 680,
        }}>
          Practice. Submit.<br />Climb the board.
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 16, maxWidth: 480, lineHeight: 1.7, margin: "0 0 32px" }}>
          Self-hosted grader with instant verdicts, score tracking, and a leaderboard for your group.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/problems" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 22px",
            background: "var(--ink)", color: "var(--bg)",
            borderRadius: 999, fontSize: 14, fontWeight: 500,
            textDecoration: "none", transition: "all 0.15s",
          }}>
            Browse Problems <ArrowRight style={{ width: 15, height: 15 }} />
          </Link>
          <Link href="/auth" style={{
            display: "inline-flex", alignItems: "center",
            padding: "11px 22px",
            border: "1px solid var(--line)", color: "var(--ink)",
            borderRadius: 999, fontSize: 14,
            textDecoration: "none", transition: "all 0.15s",
          }}>
            Login / Sign up
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <FeatureCard
          icon={<Code2 style={{ width: 20, height: 20, color: "var(--clay)" }} />}
          title="Problem Set"
          body="Browse problems with points, time limits, and difficulty levels."
        />
        <FeatureCard
          icon={<ScrollText style={{ width: 20, height: 20, color: "var(--clay)" }} />}
          title="Submissions"
          body="See every attempt, inspect source code, and compare strategies."
        />
        <FeatureCard
          icon={<Trophy style={{ width: 20, height: 20, color: "var(--clay)" }} />}
          title="Leaderboard"
          body="Track total score and solved counts in your group hall of fame."
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "24px 24px 22px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", margin: "0 0 8px", fontWeight: 400 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>{body}</p>
    </div>
  );
}
