import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/services/problems";
import { AdminStats } from "@/components/admin-stats";

export const metadata = { title: "Statistics — nograder admin" };

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");
  if (!(await isAdmin(user.id))) redirect("/");

  return (
    <div className="page">
      <AdminStats />
    </div>
  );
}
