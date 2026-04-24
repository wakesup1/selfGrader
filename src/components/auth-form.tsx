"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { IconEye, IconCup } from "@/components/icons";

type Mode = "signin" | "signup" | "forgot";

function calcStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  return score;
}

const EyeOpen = () => <IconEye size={18} strokeWidth={1.8} />;
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const BrandMark = ({ size = 36 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "var(--ink)", display: "grid", placeItems: "center",
    flexShrink: 0,
  }}>
    <IconCup size={Math.round(size * 0.55)} style={{ color: "var(--bg)" }} strokeWidth={1.4} />
  </div>
);

function ArtPanel({ mode }: { mode: Mode }) {
  const isSignin = mode !== "signup";
  return (
    <div style={{
      background: "var(--bg-warm)",
      padding: "40px 48px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      borderRight: "1px solid var(--kraft-2)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(120,110,90,0.07) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        pointerEvents: "none",
      }} />

      <Link href="/" style={{
        position: "relative", zIndex: 1,
        fontFamily: "var(--mono)", fontSize: 11,
        letterSpacing: "0.14em", color: "var(--muted)",
        textTransform: "uppercase",
      }}>
        ← back to cafe
      </Link>

      <div style={{
        position: "relative", zIndex: 1, flex: 1,
        display: "flex", flexDirection: "column",
        justifyContent: "center", maxWidth: 520,
      }}>
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <BrandMark size={52} />
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1.1 }}>nograder</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase" }}>cafe · grade · chill</div>
          </div>
        </div>

        <div style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 36, lineHeight: 1.25, letterSpacing: "-0.015em",
          color: "var(--ink)", marginBottom: 24,
        }}>
          {isSignin
            ? "\u201cThe best testcase is the one you didn\u2019t think of \u2014 order another cup and try again.\u201d"
            : "\u201cEvery regular started as a stranger walking in. Pull up a chair \u2014 the grader\u2019s patient.\u201d"}
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.18em", color: "var(--muted)", textTransform: "uppercase",
        }}>
          {isSignin ? "— house note · 4.23.26" : "— barista's note · open bar"}
        </div>

        {/* Receipt card */}
        <div style={{
          background: "var(--surface)", border: "1px dashed var(--kraft-2)",
          borderRadius: 12, padding: "20px 22px", marginTop: 32,
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)",
          maxWidth: 320,
        }}>
          <div style={{
            textAlign: "center",
            borderBottom: "1px dashed var(--kraft-2)",
            paddingBottom: 10, marginBottom: 10,
            fontSize: 10.5, letterSpacing: "0.2em",
            color: "var(--muted)", textTransform: "uppercase",
          }}>
            {isSignin ? "welcome back receipt" : "starter kit · complimentary"}
          </div>
          {isSignin ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>problems solved</span><span>147</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>current streak</span><span>12 days</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>last brew</span><span>21h ago</span></div>
              <div style={{
                display: "flex", justifyContent: "space-between", padding: "4px 0",
                borderTop: "1px dashed var(--kraft-2)", marginTop: 10, paddingTop: 10,
                fontWeight: 500, color: "var(--ink)",
              }}><span>rank</span><span>#9 hall of fame</span></div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>420+ problems</span><span>free</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>live testcases</span><span>free</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>c++ · python · java</span><span>free</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>hall of fame seat</span><span>free</span></div>
              <div style={{
                display: "flex", justifyContent: "space-between", padding: "4px 0",
                borderTop: "1px dashed var(--kraft-2)", marginTop: 10, paddingTop: 10,
                fontWeight: 500, color: "var(--ink)",
              }}><span>total</span><span>on the house</span></div>
            </>
          )}
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        fontFamily: "var(--mono)", fontSize: 11,
        letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase",
      }}>
        {isSignin ? "open since 2024 · brewed in bangkok" : "open to everyone · no course key required"}
      </div>
    </div>
  );
}

export function AuthForm() {
  const searchParams = useSearchParams();
  const queryMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(queryMode);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [keepIn, setKeepIn]     = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const strength = calcStrength(password);
  const strengthLabel =
    password.length === 0 ? "pick something memorable" :
    strength <= 1         ? "a bit weak — try longer" :
    strength <= 2         ? "okay · add a number or symbol" :
    strength <= 3         ? "nicely brewed" : "strong · perfect blend";

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setSuccess("");
    setPassword("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    border: "1px solid var(--line)", borderRadius: 10,
    background: "var(--surface)", fontSize: 15,
    fontFamily: "var(--sans)", color: "var(--ink)",
    outline: "none", transition: "all 0.15s",
    boxSizing: "border-box",
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClient();

    try {
      if (mode === "forgot") {
        if (!email.trim()) { setError("Please enter your email address."); return; }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/auth/reset`,
        });
        if (err) { setError(err.message); return; }
        setSuccess("Check your inbox — we sent a password reset link.");
        return;
      }

      if (!email.trim()) { setError("Email is required."); return; }
      if (!password)     { setError("Password is required."); return; }

      if (mode === "signup") {
        if (username.trim().length < 3) { setError("Username must be at least 3 characters."); return; }
        if (password.length < 6)        { setError("Password must be at least 6 characters."); return; }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
            emailRedirectTo: `${siteUrl}/auth`,
          },
        });
        if (err) { setError(err.message); return; }
        if (data.session) { window.location.href = "/problems"; return; }
        setSuccess("Account created! Check your email to confirm, then sign in.");
        switchMode("signin");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          if (err.message.toLowerCase().includes("invalid")) {
            setError("Wrong email or password. Try again or reset your password.");
          } else {
            setError(err.message);
          }
          return;
        }
        window.location.href = "/problems";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      <ArtPanel mode={mode} />

      <div style={{ padding: "40px 48px", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        <div style={{ maxWidth: 420, width: "100%", margin: "auto", padding: "40px 0" }}>

          {/* Kicker */}
          <div style={{
            marginBottom: 32, fontFamily: "var(--mono)", fontSize: 11,
            letterSpacing: "0.2em", color: "var(--clay)", textTransform: "uppercase",
          }}>
            ●{" "}
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
          </div>

          <h1 style={{
            fontFamily: "var(--serif)", fontSize: "clamp(42px, 4vw, 56px)",
            lineHeight: 1, letterSpacing: "-0.03em", margin: "0 0 10px",
          }}>
            {mode === "signin" ? "Welcome back." : mode === "signup" ? "Pull up a chair." : "Forgot it?"}
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 36, lineHeight: 1.55 }}>
            {mode === "signin"
              ? "Pick up where you left off — your unfinished problems are still warm."
              : mode === "signup"
              ? "Takes 20 seconds. We just need somewhere to send your grader receipts."
              : "Tell us your email and we'll brew you a fresh link."}
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column" }}>
            {/* Username (signup only) */}
            {mode === "signup" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                  Display name
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="what should we call you?"
                  autoComplete="username"
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                Email
              </label>
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cafe.coffee"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div style={{ marginBottom: mode === "signup" ? 6 : 22 }}>
                <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: 48 }}
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "8+ chars · mix it up" : "your secret recipe"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--muted)", cursor: "pointer",
                      padding: 4, background: "none", border: "none",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showPwd ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            )}

            {/* Strength bar (signup) */}
            {mode === "signup" && (
              <>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: strength >= i ? "var(--clay)" : "var(--line)",
                      transition: "background 0.2s",
                    }} />
                  ))}
                </div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 11.5,
                  color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 18,
                }}>
                  {strengthLabel}
                </div>
              </>
            )}

            {/* Keep signed in + forgot (signin) */}
            {mode === "signin" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={keepIn}
                    onChange={(e) => setKeepIn(e.target.checked)}
                    style={{ accentColor: "var(--clay)", width: 14, height: 14 }}
                  />
                  Keep me signed in
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  style={{
                    fontSize: 13, color: "var(--clay)",
                    background: "none", border: "none", cursor: "pointer",
                    textDecoration: "underline", textUnderlineOffset: 3,
                    textDecorationColor: "rgba(184,104,94,0.35)",
                    fontFamily: "var(--sans)", padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Terms (signup) */}
            {mode === "signup" && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", cursor: "pointer", marginBottom: 18 }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--clay)", width: 14, height: 14 }} />
                I agree to sip responsibly
              </label>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px",
                background: "var(--clay-bg)", border: "1px solid #E3C4BE",
                borderRadius: 8, fontSize: 13, color: "#8C4B42",
              }}>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                marginBottom: 16, padding: "10px 14px",
                background: "#EDF3ED", border: "1px solid #C4D8C4",
                borderRadius: 8, fontSize: 13, color: "#3A5C3A",
              }}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: 14, borderRadius: 10,
                background: "var(--ink)", color: "var(--bg)",
                fontSize: 15, fontWeight: 500, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontFamily: "var(--sans)",
              }}
            >
              {loading
                ? "Please wait…"
                : mode === "signin" ? "Sign in →"
                : mode === "signup" ? "Create account →"
                : "Send reset link →"}
            </button>

            {mode !== "forgot" && (
              <div style={{
                fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)",
                letterSpacing: "0.04em", textAlign: "center", marginTop: 16,
              }}>
                by signing in you agree to sip responsibly
              </div>
            )}
          </form>

          {/* Switch */}
          <div style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
            {mode === "signin" && (
              <>New around here?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--sans)" }}
                >
                  Create an account
                </button>
              </>
            )}
            {mode === "signup" && (
              <>Been here before?{" "}
                <button
                  onClick={() => switchMode("signin")}
                  style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--sans)" }}
                >
                  Sign in
                </button>
              </>
            )}
            {mode === "forgot" && (
              <>Remembered it?{" "}
                <button
                  onClick={() => switchMode("signin")}
                  style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--sans)" }}
                >
                  Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
