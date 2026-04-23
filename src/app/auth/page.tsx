import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  return (
    <section style={{ maxWidth: 420, margin: "0 auto", width: "100%", padding: "64px 24px 80px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--ink)", color: "var(--bg)",
          display: "grid", placeItems: "center", margin: "0 auto 16px",
          fontFamily: "var(--serif)", fontSize: 30, lineHeight: 1, paddingBottom: 2,
        }}>
          n
        </div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>nograder</p>
        <p style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
          cafe · grade · chill
        </p>
      </div>
      <Suspense fallback={<p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>Loading…</p>}>
        <AuthForm />
      </Suspense>
    </section>
  );
}
