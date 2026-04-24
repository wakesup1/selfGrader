import { createClient } from "@/lib/supabase/server";
import { ProblemsTableFull } from "@/components/problems-table-full";
import { DashboardHero } from "@/components/dashboard-hero";
import { DashboardSubmitBox } from "@/components/dashboard-submit-box";
import { AnnouncementBoard, type Announcement } from "@/components/announcement-board";
import { LandingPage } from "@/components/landing-page";
import type { Problem } from "@/lib/types";

type UserStat = { problem_id: number; best_score: number; is_solved: boolean };

export type ProblemWithStat = Problem & { userStat: { best_score: number; is_solved: boolean } | null };

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Show landing page for logged-out visitors
  if (!user) {
    const [{ data: landingProblems, count: problemCount }, { count: userCount }] = await Promise.all([
      supabase
        .from("problems")
        .select("id, title, difficulty, points", { count: "exact" })
        .eq("is_published", true)
        .order("id", { ascending: true })
        .limit(12)
        .returns<{ id: number; title: string; difficulty: string; points: number }[]>(),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
    ]);
    return (
      <LandingPage
        problems={landingProblems ?? []}
        problemCount={problemCount ?? 0}
        userCount={userCount ?? 0}
      />
    );
  }

  let username: string | null = null;
  let solvedCount = 0;
  let totalScore = 0;
  let isAdmin = false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, solved_count, total_score, is_admin")
    .eq("id", user.id)
    .single<{ username: string; solved_count: number; total_score: number; is_admin: boolean }>();
  username    = profile?.username    ?? null;
  solvedCount = profile?.solved_count ?? 0;
  totalScore  = profile?.total_score  ?? 0;
  isAdmin     = profile?.is_admin     ?? false;

  const [{ data: problems }, { data: userStats }, { data: announcements }] = await Promise.all([
    supabase
      .from("problems")
      .select("id, title, slug, difficulty, points, time_limit, memory_limit, is_published, description, constraints, pdf_url, created_at")
      .eq("is_published", true)
      .order("id", { ascending: true })
      .returns<Problem[]>(),
    supabase
      .from("user_problem_stats")
      .select("problem_id, best_score, is_solved")
      .eq("user_id", user.id)
      .returns<UserStat[]>(),
    // Admins see drafts too so they can preview before publishing
    isAdmin
      ? supabase
          .from("announcements")
          .select("id, tag, title, body, pinned, is_published, updated_at")
          .order("pinned",     { ascending: false })
          .order("updated_at", { ascending: false })
          .returns<Announcement[]>()
      : supabase
          .from("announcements")
          .select("id, tag, title, body, pinned, is_published, updated_at")
          .eq("is_published", true)
          .order("pinned",     { ascending: false })
          .order("updated_at", { ascending: false })
          .returns<Announcement[]>(),
  ]);

  const statsMap = new Map<number, UserStat>();
  userStats?.forEach((s) => statsMap.set(s.problem_id, s));

  const problemsWithStats: ProblemWithStat[] = (problems ?? []).map((p) => ({
    ...p,
    userStat: statsMap.get(p.id) ?? null,
  }));

  return (
    <div className="page">
      {/* Hero */}
      <DashboardHero
        username={username}
        solvedCount={solvedCount}
        totalScore={totalScore}
        isLoggedIn={!!user}
      />

      {/* Submit box */}
      <div style={{ marginBottom: 28 }}>
        <DashboardSubmitBox problems={problemsWithStats} isLoggedIn={!!user} />
      </div>

      {/* Main grid: problems table + announcements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
        <ProblemsTableFull problems={problemsWithStats} isLoggedIn={!!user} />

        <AnnouncementBoard
          initial={announcements ?? []}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
