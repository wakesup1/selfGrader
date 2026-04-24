// Stats service — all DB queries + computation for admin analytics
// Uses admin client (service role) to bypass RLS.

import { createAdminClient } from "@/lib/supabase/admin";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StatsOverview {
  classAverage: number;
  studentsEnrolled: number;
  totalSubmissions: number;
  atRiskCount: number;
  starStudentCount: number;
}

export interface StatsProblem {
  id: number;
  title: string;
  difficulty: string;
  avgScore: number;
  submissionCount: number;
  points: number;
}

export interface StatsDistribution {
  problemId: number;
  buckets: { label: string; min: number; max: number; count: number }[];
  n: number;
  avgScore: number;
  fullMarks: number;
  zeros: number;
}

export interface StatsTestcaseRates {
  problemId: number;
  testcaseCount: number;
  rates: number[];
}

export interface StatsCohortStudent {
  userId: string;
  handle: string;
  name: string;
  avgScore: number;
  submissionCount: number;
  lastSubmittedAt: string | null;
}

export interface StatsTrend {
  days: number;
  points: { date: string; submissionCount: number; avgScore: number }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Normalize a raw score (0..points) to a 0–100 percentage. */
function normPct(score: number, points: number): number {
  if (points <= 0) return 0;
  return Math.min(100, Math.round((score / points) * 100));
}

/** Compute average of a number array (returns 0 on empty). */
function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ── 1. Overview ────────────────────────────────────────────────────────────────

export async function getStatsOverview(): Promise<StatsOverview> {
  const admin = createAdminClient();

  const [
    { data: problems },
    { data: userStats },
    { count: studentsEnrolled },
    { count: totalSubmissions },
  ] = await Promise.all([
    admin.from("problems").select("id, points").eq("is_published", true),
    admin.from("user_problem_stats").select("user_id, problem_id, best_score"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
    admin.from("submissions").select("*", { count: "exact", head: true }),
  ]);

  const pointsMap = new Map<number, number>();
  (problems ?? []).forEach((p) => pointsMap.set(p.id, p.points));

  // Build per-student list of score percentages
  const byUser = new Map<string, number[]>();
  for (const s of userStats ?? []) {
    const pts = pointsMap.get(s.problem_id);
    if (!pts) continue;
    const pct = normPct(s.best_score, pts);
    if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
    byUser.get(s.user_id)!.push(pct);
  }

  const studentAvgs = Array.from(byUser.values()).map(avg);
  const classAverage = parseFloat(avg(studentAvgs).toFixed(1));

  return {
    classAverage,
    studentsEnrolled: studentsEnrolled ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    atRiskCount: studentAvgs.filter((a) => a < 60).length,
    starStudentCount: studentAvgs.filter((a) => a >= 90).length,
  };
}

// ── 2. Problems list ───────────────────────────────────────────────────────────

export async function getStatsProblems(): Promise<StatsProblem[]> {
  const admin = createAdminClient();

  const [{ data: problems }, { data: stats }, { data: subCounts }] = await Promise.all([
    admin
      .from("problems")
      .select("id, title, difficulty, points")
      .eq("is_published", true)
      .order("id", { ascending: true }),
    admin.from("user_problem_stats").select("problem_id, best_score"),
    admin
      .from("submissions")
      .select("problem_id"),
  ]);

  const subCountMap = new Map<number, number>();
  for (const s of subCounts ?? []) {
    subCountMap.set(s.problem_id, (subCountMap.get(s.problem_id) ?? 0) + 1);
  }

  const scoresByProblem = new Map<number, number[]>();
  for (const s of stats ?? []) {
    if (!scoresByProblem.has(s.problem_id)) scoresByProblem.set(s.problem_id, []);
    scoresByProblem.get(s.problem_id)!.push(s.best_score);
  }

  return (problems ?? []).map((p) => {
    const scores = (scoresByProblem.get(p.id) ?? []).map((s) => normPct(s, p.points));
    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      avgScore: parseFloat(avg(scores).toFixed(1)),
      submissionCount: subCountMap.get(p.id) ?? 0,
      points: p.points,
    };
  });
}

// ── 3. Score distribution for one problem ─────────────────────────────────────

const BUCKET_BOUNDS = [
  [0, 0], [1, 10], [11, 20], [21, 30], [31, 40], [41, 50],
  [51, 60], [61, 70], [71, 80], [81, 99], [100, 100],
] as const;
const BUCKET_LABELS = ["0", "1-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-99", "100"];

export async function getStatsProblemDistribution(problemId: number): Promise<StatsDistribution> {
  const admin = createAdminClient();

  const [{ data: problem }, { data: stats }] = await Promise.all([
    admin.from("problems").select("id, points").eq("id", problemId).single(),
    admin.from("user_problem_stats").select("best_score").eq("problem_id", problemId),
  ]);

  if (!problem) throw new Error("Problem not found");

  const scores = (stats ?? []).map((s) => normPct(s.best_score, problem.points));

  const buckets = BUCKET_BOUNDS.map(([min, max], i) => ({
    label: BUCKET_LABELS[i],
    min,
    max,
    count: scores.filter((s) => s >= min && s <= max).length,
  }));

  return {
    problemId,
    buckets,
    n: scores.length,
    avgScore: parseFloat(avg(scores).toFixed(1)),
    fullMarks: scores.filter((s) => s === 100).length,
    zeros: scores.filter((s) => s === 0).length,
  };
}

// ── 4. Testcase pass rates ─────────────────────────────────────────────────────

export async function getStatsProblemTestcaseRates(problemId: number): Promise<StatsTestcaseRates> {
  const admin = createAdminClient();

  const [{ data: testCases }, { data: submissions }] = await Promise.all([
    admin.from("test_cases").select("id").eq("problem_id", problemId),
    admin
      .from("submissions")
      .select("passed_count, total_count")
      .eq("problem_id", problemId)
      .gt("total_count", 0),
  ]);

  const testcaseCount = testCases?.length ?? 0;
  const subs = submissions ?? [];

  if (testcaseCount === 0 || subs.length === 0) {
    return { problemId, testcaseCount, rates: Array(testcaseCount).fill(0) };
  }

  // For testcase i (0-indexed): rate = fraction of submissions where passed_count > i
  // (Grader stops on first failure, so passed_count = N means first N testcases passed)
  const rates = Array.from({ length: testcaseCount }, (_, i) =>
    subs.filter((s) => s.passed_count > i).length / subs.length
  );

  return { problemId, testcaseCount, rates };
}

// ── 5. Cohort roster ───────────────────────────────────────────────────────────

export async function getStatsCohort(): Promise<StatsCohortStudent[]> {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: userStats },
    { data: problems },
    { data: submissions },
  ] = await Promise.all([
    admin.from("profiles").select("id, username").eq("is_admin", false),
    admin.from("user_problem_stats").select("user_id, problem_id, best_score"),
    admin.from("problems").select("id, points").eq("is_published", true),
    admin
      .from("submissions")
      .select("user_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const pointsMap = new Map<number, number>();
  (problems ?? []).forEach((p) => pointsMap.set(p.id, p.points));

  const byUser = new Map<string, number[]>();
  for (const s of userStats ?? []) {
    const pts = pointsMap.get(s.problem_id);
    if (!pts) continue;
    if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
    byUser.get(s.user_id)!.push(normPct(s.best_score, pts));
  }

  const subCounts = new Map<string, number>();
  const lastSub = new Map<string, string>();
  for (const s of submissions ?? []) {
    subCounts.set(s.user_id, (subCounts.get(s.user_id) ?? 0) + 1);
    if (!lastSub.has(s.user_id)) lastSub.set(s.user_id, s.created_at);
  }

  return (profiles ?? [])
    .map((p) => {
      const scores = byUser.get(p.id) ?? [];
      return {
        userId: p.id,
        handle: p.username,
        name: p.username,
        avgScore: parseFloat(avg(scores).toFixed(1)),
        submissionCount: subCounts.get(p.id) ?? 0,
        lastSubmittedAt: lastSub.get(p.id) ?? null,
      };
    })
    .filter((u) => u.submissionCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore);
}

// ── 6. Daily trend ─────────────────────────────────────────────────────────────

export async function getStatsTrend(days = 14): Promise<StatsTrend> {
  const admin = createAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const [{ data: submissions }, { data: problems }] = await Promise.all([
    admin
      .from("submissions")
      .select("score, problem_id, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
    admin.from("problems").select("id, points"),
  ]);

  const pointsMap = new Map<number, number>();
  (problems ?? []).forEach((p) => pointsMap.set(p.id, p.points));

  // Pre-populate all days
  const byDate = new Map<string, { count: number; scores: number[] }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDate.set(d.toISOString().split("T")[0], { count: 0, scores: [] });
  }

  for (const s of submissions ?? []) {
    const key = s.created_at.split("T")[0];
    if (!byDate.has(key)) continue;
    const pts = pointsMap.get(s.problem_id) ?? 100;
    const entry = byDate.get(key)!;
    entry.count++;
    entry.scores.push(normPct(s.score, pts));
  }

  const points = Array.from(byDate.entries()).map(([date, { count, scores }]) => ({
    date,
    submissionCount: count,
    avgScore: parseFloat(avg(scores).toFixed(1)),
  }));

  return { days, points };
}

// ── 7. CSV export ──────────────────────────────────────────────────────────────

export async function getStatsCohortCsv(): Promise<string> {
  const cohort = await getStatsCohort();
  const header = "handle,name,avg_score,submission_count,last_submitted_at\n";
  const rows = cohort.map((s) =>
    [s.handle, s.name, s.avgScore, s.submissionCount, s.lastSubmittedAt ?? ""].join(",")
  );
  return header + rows.join("\n");
}
