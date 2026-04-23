import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Authentication</h1>
      <AuthForm />
    </section>
  );
}
