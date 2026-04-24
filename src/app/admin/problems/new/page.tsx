import { redirect } from "next/navigation";
import { AdminProblemForm } from "@/components/admin-problem-form";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NewProblemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  if (!profile?.is_admin) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-zinc-100">Admin Only</h1>
        <p className="mt-2 text-zinc-400">Set is_admin=true in profiles table for your account.</p>
      </section>
    );
  }

  return <AdminProblemForm />;
}
