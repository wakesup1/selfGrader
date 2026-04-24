import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      overflowY: "auto", background: "var(--bg)",
    }}>
      <Suspense fallback={
        <div style={{
          minHeight: "100vh", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)",
        }}>
          Loading…
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}
