"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const mode: Mode = selectedMode ?? queryMode;

  function validateInputs() {
    if (!email.trim()) return "Email is required.";
    if (!password) return "Password is required.";
    if (mode === "signup") {
      if (username.trim().length < 3) return "Username must be at least 3 characters.";
      if (password.length < 6) return "Password must be at least 6 characters.";
    }
    return null;
  }

  async function submit() {
    const supabase = createClient();
    setLoading(true);
    setMessage("");

    try {
      const err = validateInputs();
      if (err) { setMessage(err); return; }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        });
        if (error) { setMessage(error.message); return; }
        if (data.session) { router.push("/problems"); router.refresh(); return; }
        setSelectedMode("login");
        setMessage("Account created. Log in to continue.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setMessage(error.message); return; }
        router.push("/problems");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cannot connect to authentication service.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!loading) await submit();
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1px solid var(--line)", borderRadius: 8,
    background: "var(--surface)", fontSize: 14,
    fontFamily: "var(--sans)", color: "var(--ink)",
    outline: "none", transition: "border-color 0.15s",
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "28px 28px 24px", boxShadow: "var(--shadow)" }}>
      {/* Mode toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "var(--bg-warm)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelectedMode(m)}
            style={{
              padding: "8px", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
              background: mode === m ? "var(--surface)" : "transparent",
              color: mode === m ? "var(--ink)" : "var(--muted)",
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              border: "none", cursor: "pointer", transition: "all 0.15s",
              fontFamily: "var(--sans)",
            }}
          >
            {m === "login" ? "Login" : "Sign up"}
          </button>
        ))}
      </div>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", margin: "0 0 4px", fontWeight: 400 }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
          {mode === "login" ? "Sign in to your nograder account." : "Join nograder with email and password."}
        </p>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={onSubmit}>
        {mode === "signup" && (
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
            minLength={3}
          />
        )}
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
        />
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "11px",
            background: "var(--ink)", color: "var(--bg)",
            borderRadius: 999, fontSize: 14, fontWeight: 500,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "all 0.15s",
            fontFamily: "var(--sans)", marginTop: 4,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        {message && (
          <p style={{ fontSize: 13, color: "var(--clay)", margin: 0, textAlign: "center" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
