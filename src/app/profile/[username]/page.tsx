import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile-view";
import type { Profile } from "@/lib/types";

type Submission = {
  id: number;
  problem_id: number;
  language_id: number;
  status: string;
  score: number;
  created_at: string;
  problems: { title: string } | null;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, total_score, solved_count, is_admin, created_at")
      .eq("username", decodeURIComponent(username))
      .single<Profile & { created_at: string }>(),
    supabase.auth.getUser(),
  ]);

  if (!profile) notFound();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, problem_id, language_id, status, score, created_at, problems(title)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Submission[]>();

  // Check if the viewer is looking at their own profile
  let isOwnProfile = false;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single<{ username: string }>();
    isOwnProfile = viewerProfile?.username === profile.username;
  }

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <ProfileView
        username={profile.username}
        solvedCount={profile.solved_count}
        totalScore={profile.total_score}
        isAdmin={profile.is_admin}
        joinedAt={profile.created_at}
        submissions={submissions ?? []}
        isOwnProfile={isOwnProfile}
      />
    </section>
  );
}
