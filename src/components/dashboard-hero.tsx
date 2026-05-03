"use client";

function CupIllustration({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6">
        <path className="steam-path" d="M45 40 C 42 32, 50 28, 46 20" />
        <path className="steam-path" d="M60 40 C 57 32, 65 28, 61 20" />
        <path className="steam-path" d="M75 40 C 72 32, 80 28, 76 20" />
      </g>
      <ellipse cx="60" cy="50" rx="34" ry="6" fill="var(--kraft)" />
      <path d="M26 50 h68 v32 a14 14 0 0 1 -14 14 h-40 a14 14 0 0 1 -14 -14 z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
      <ellipse cx="60" cy="50" rx="30" ry="4.5" fill="var(--amber)" opacity="0.7" />
      <path d="M94 58 a12 12 0 0 1 0 20" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
      <path d="M34 100 h52" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}

export function DashboardHero({
  username,
  solvedCount,
  totalScore,
  isLoggedIn,
}: {
  username: string | null;
  solvedCount: number;
  totalScore: number;
  isLoggedIn: boolean;
}) {
  const firstName = username ? username.split(/[\s_]/)[0] : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="card-kraft" style={{ padding: "36px 40px", display: "flex", alignItems: "center", gap: 32, marginBottom: 28 }}>
      <div style={{ flex: 1 }}>
        <div className="kicker" style={{ marginBottom: 12 }}>today&apos;s brew · nograder</div>
        <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0 }}>
          {isLoggedIn && firstName ? (
            <>
              {greeting},{" "}
              <em style={{ fontStyle: "italic", color: "var(--clay)" }}>{firstName}.</em>
              <br />
              Pull up a chair — the grader&apos;s warm.
            </>
          ) : (
            <>
              Welcome to nograder.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--clay)" }}>Pull up a chair.</em>
            </>
          )}
        </h1>

        <div style={{ display: "flex", gap: 36, marginTop: 24 }}>
          {isLoggedIn ? (
            <>
              <StatItem label="Solved"      value={String(solvedCount)} />
              <Divider />
              <StatItem label="Total Score" value={String(totalScore)} />
              <Divider />
              <StatItem label="Platform"    value="NoGrader" hint="Self-hosted" />
            </>
          ) : (
            <>
              <StatItem label="Grader"    value="Cafe" hint="Self-hosted" />
              <Divider />
              <StatItem label="Languages" value="3"    hint="C++ · Python · Java" />
              <Divider />
              <StatItem label="Status"    value="Open" hint="Brewing since 2024" />
            </>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <CupIllustration size={160} />
      </div>
    </div>
  );
}

function StatItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 4 }}>{label}</div>
      <div className="serif" style={{ fontSize: 32, lineHeight: 1 }}>{value}</div>
      {hint && <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "var(--kraft-2)", alignSelf: "stretch" }} />;
}
