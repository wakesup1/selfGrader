"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type LandingProblem = { id: number; title: string; difficulty: string; points: number };

const BrandMark = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="var(--ink)" />
    <g stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85">
      <path d="M15 11 C 14 9, 16 8, 15 6" />
      <path d="M20 11 C 19 9, 21 8, 20 6" />
      <path d="M25 11 C 24 9, 26 8, 25 6" />
    </g>
    <path d="M11 15 h15 v8 a5 5 0 0 1 -5 5 h-5 a5 5 0 0 1 -5 -5 z" fill="var(--bg)" />
    <path d="M26 17 a3 3 0 0 1 0 6" stroke="var(--bg)" strokeWidth="1.6" fill="none" />
  </svg>
);

function LandingNav() {
  return (
    <nav style={{
      padding: "24px 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      maxWidth: 1480,
      margin: "0 auto",
      width: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BrandMark size={42} />
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1.1 }}>nograder</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>cafe · grade · chill</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Now brewing
        </span>
        <Link href="/auth?mode=login" className="btn btn-ghost">Sign in</Link>
        <Link href="/auth?mode=signup" className="btn btn-primary">Create account →</Link>
      </div>
    </nav>
  );
}

/* ── Editorial (Variant A) ─────────────────────────────────────────── */
function EditorialLanding({ problemCount }: { problemCount: number }) {
  const countLabel = problemCount > 0 ? `${problemCount}` : "—";

  return (
    <>
      <LandingNav />
      <section style={{
        minHeight: "calc(100vh - 88px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px",
      }}>
        <div style={{ textAlign: "center", maxWidth: 720 }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11,
            letterSpacing: "0.24em", color: "var(--muted)",
            textTransform: "uppercase", marginBottom: 32,
          }}>
            est. 2024 · open to everyone
          </div>

          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "var(--ink)", margin: "0 auto 28px",
            display: "grid", placeItems: "center",
          }}>
            <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
              <g stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85">
                <path d="M15 11 C 14 9, 16 8, 15 6" />
                <path d="M20 11 C 19 9, 21 8, 20 6" />
                <path d="M25 11 C 24 9, 26 8, 25 6" />
              </g>
              <path d="M11 15 h15 v8 a5 5 0 0 1 -5 5 h-5 a5 5 0 0 1 -5 -5 z" fill="var(--bg)" />
              <path d="M26 17 a3 3 0 0 1 0 6" stroke="var(--bg)" strokeWidth="1.6" fill="none" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: "var(--serif)", fontSize: "clamp(60px, 8vw, 96px)",
            lineHeight: 0.95, letterSpacing: "-0.035em", margin: "0 0 20px",
          }}>
            Code, <em style={{ fontStyle: "italic", color: "var(--clay)" }}>brewed</em><br />
            the way you like it.
          </h1>

          <p style={{
            fontSize: 18, color: "var(--ink-soft)",
            lineHeight: 1.6, maxWidth: 540, margin: "0 auto 40px",
          }}>
            A quiet corner of the internet for people who like solving problems with a good cup of something warm. Competitive programming, without the shouting.
          </p>

          <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
            <Link href="/auth?mode=signup" className="btn btn-primary" style={{ padding: "14px 26px", fontSize: 15, borderRadius: 999 }}>
              Create an account →
            </Link>
            <Link href="/auth?mode=login" className="btn btn-ghost" style={{ padding: "14px 26px", fontSize: 15, borderRadius: 999 }}>
              Sign in
            </Link>
          </div>

          <div style={{ marginTop: 24, fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>Already a regular?</span>
            <Link href="/auth?mode=login" style={{
              color: "var(--clay)", textDecoration: "underline",
              textUnderlineOffset: 3, textDecorationColor: "rgba(184,104,94,0.4)",
            }}>
              Sign in here
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{
        padding: "18px 0",
        borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
        background: "var(--bg-warm)",
        fontFamily: "var(--mono)", fontSize: 12,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--muted)", overflow: "hidden", whiteSpace: "nowrap",
        marginTop: 48,
      }}>
        <div style={{ display: "inline-flex", gap: 48, animation: "marquee-scroll 50s linear infinite" }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri} style={{ display: "inline-flex", gap: 48, flexShrink: 0 }}>
              <span>{countLabel} problems on the menu</span>
              <span style={{ color: "var(--clay)" }}>●</span>
              <span>live testcases</span>
              <span style={{ color: "var(--clay)" }}>●</span>
              <span>open to everyone</span>
              <span style={{ color: "var(--clay)" }}>●</span>
              <span>c++ · python · java · verilog</span>
              <span style={{ color: "var(--clay)" }}>●</span>
              <span>brewing since 2024</span>
              <span style={{ color: "var(--clay)" }}>●</span>
              <span>hall of fame</span>
              <span style={{ color: "var(--clay)" }}>●</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Menu-board (Variant B) ─────────────────────────────────────────── */
type MenuSection = { label: string; items: LandingProblem[] };

function difficultyLabel(d: string) {
  if (d === "Easy")   return "intro · house roast";
  if (d === "Hard")   return "advanced · extra shot";
  return "medium roast";
}

function buildMenuSections(problems: LandingProblem[]): MenuSection[] {
  const easy   = problems.filter((p) => p.difficulty === "Easy").slice(0, 4);
  const medium = problems.filter((p) => p.difficulty === "Medium").slice(0, 4);
  const hard   = problems.filter((p) => p.difficulty === "Hard").slice(0, 3);
  return [
    { label: "signature blends", items: medium },
    { label: "seasonal",         items: hard   },
    { label: "house roast",      items: easy   },
  ].filter((s) => s.items.length > 0);
}

function MenuBoardLanding({
  problems,
  problemCount,
  userCount,
}: {
  problems: LandingProblem[];
  problemCount: number;
  userCount: number;
}) {
  const sections = buildMenuSections(problems);
  const countLabel = problemCount > 0 ? `${problemCount}+` : "—";
  const userLabel  = userCount  > 0
    ? userCount >= 1000 ? `${(userCount / 1000).toFixed(1)}k` : `${userCount}`
    : "—";

  return (
    <>
      <LandingNav />
      <section style={{
        minHeight: "calc(100vh - 88px)",
        padding: "20px 48px 60px",
        maxWidth: 1480, margin: "0 auto", width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 48, alignItems: "center",
      }}>
        {/* Left */}
        <div style={{ padding: "20px 0" }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11,
            letterSpacing: "0.24em", color: "var(--clay)",
            textTransform: "uppercase", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ display: "block", width: 28, height: 1, background: "var(--clay)" }} />
            today&apos;s brew · open bar
          </div>
          <h1 style={{
            fontFamily: "var(--serif)", fontSize: "clamp(72px, 8vw, 112px)",
            lineHeight: 0.92, letterSpacing: "-0.035em", margin: "0 0 24px",
          }}>
            Pull up a chair.<br />
            The grader&apos;s <em style={{ fontStyle: "italic", color: "var(--clay)" }}>warm.</em>
          </h1>
          <p style={{
            fontSize: 19, color: "var(--ink-soft)",
            lineHeight: 1.65, maxWidth: 540, marginBottom: 36,
          }}>
            An online judge that feels like a cafe. Pick a problem from the menu, order up a solution, and we&apos;ll brew it against every testcase.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 40 }}>
            <Link href="/auth?mode=signup" className="btn btn-primary" style={{ padding: "14px 26px", fontSize: 15, borderRadius: 999 }}>
              Start your tab →
            </Link>
            <Link href="/auth?mode=login" className="btn btn-ghost" style={{ padding: "14px 26px", fontSize: 15, borderRadius: 999 }}>
              I have an account
            </Link>
          </div>
          <div style={{
            display: "flex", gap: 40,
            paddingTop: 28, borderTop: "1px solid var(--kraft-2)",
          }}>
            {[
              { num: countLabel, lbl: "on the menu" },
              { num: userLabel,  lbl: "regulars"    },
              { num: "24/7",     lbl: "open hours"  },
            ].map((s) => (
              <div key={s.lbl}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.num}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginTop: 6 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: dark menu board */}
        <div style={{
          background: "#1F2620", borderRadius: 24, padding: "40px 36px",
          color: "#E6E1D2", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.4)",
          position: "relative", fontFamily: "var(--mono)", minHeight: 520,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}>
          {/* Corner bolts */}
          <span style={{ position: "absolute", top: 14, left: 14, width: 10, height: 10, borderRadius: "50%", background: "#C89B6B", boxShadow: "0 0 0 2px rgba(200,155,107,0.2)" }} />
          <span style={{ position: "absolute", top: 14, right: 14, width: 10, height: 10, borderRadius: "50%", background: "#C89B6B", boxShadow: "0 0 0 2px rgba(200,155,107,0.2)" }} />

          <div style={{
            textAlign: "center",
            paddingBottom: 20, borderBottom: "1px dashed rgba(230,225,210,0.25)",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: "#9A9A82", textTransform: "uppercase" }}>
              today&apos;s menu · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase()}
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 34, fontWeight: 400, color: "#F3EDD7", margin: "4px 0 6px", letterSpacing: "-0.01em" }}>the grader</h3>
            <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: "#9A9A82", textTransform: "uppercase" }}>served hot, graded true</div>
          </div>

          {sections.length === 0 ? (
            <div style={{ color: "#9A9A82", fontSize: 12, textAlign: "center", padding: "40px 0", letterSpacing: "0.1em" }}>
              menu coming soon · check back later
            </div>
          ) : sections.map((section) => (
            <div key={section.label}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#7A7A65", margin: "18px 0 4px" }}>
                — {section.label} —
              </div>
              {section.items.map((m) => (
                <div key={m.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  alignItems: "baseline", gap: 12, padding: "10px 0", fontSize: 13.5,
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "#F3EDD7" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "#9A9A82", letterSpacing: "0.04em" }}>{difficultyLabel(m.difficulty)}</div>
                  </div>
                  <div style={{ color: "#C89B6B", letterSpacing: "0.04em", fontSize: 12 }}>{m.points} pts</div>
                </div>
              ))}
            </div>
          ))}

          <div style={{
            marginTop: 22, paddingTop: 16,
            borderTop: "1px dashed rgba(230,225,210,0.25)",
            fontSize: 10.5, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#9A9A82",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>est. 2024</span>
            <span>sign in to order</span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Root component ─────────────────────────────────────────────────── */
export function LandingPage({
  problems,
  problemCount,
  userCount,
}: {
  problems: LandingProblem[];
  problemCount: number;
  userCount: number;
}) {
  const [variant, setVariant] = useState<"editorial" | "menu">("editorial");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("landing_variant");
    if (saved === "menu" || saved === "editorial") setVariant(saved);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("landing_variant", variant);
  }, [variant, mounted]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      overflowY: "auto", background: "var(--bg)",
    }}>
      {/* Variant toggle pill */}
      <div style={{
        position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 999, padding: 4,
        display: "flex", gap: 2,
        boxShadow: "var(--shadow)", zIndex: 50,
      }}>
        {(["editorial", "menu"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            style={{
              padding: "7px 16px", borderRadius: 999,
              fontFamily: "var(--mono)", fontSize: 11,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: variant === v ? "var(--bg)" : "var(--muted)",
              background: variant === v ? "var(--ink)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {v === "editorial" ? "Editorial" : "Menu board"}
          </button>
        ))}
      </div>

      {variant === "editorial"
        ? <EditorialLanding problemCount={problemCount} />
        : <MenuBoardLanding problems={problems} problemCount={problemCount} userCount={userCount} />}
    </div>
  );
}
