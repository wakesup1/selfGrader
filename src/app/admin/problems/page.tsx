import Link from "next/link";
import { notFound } from "next/navigation";
import { IconPlus, IconEdit } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ProblemRow = {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  is_published: boolean;
  created_at: string;
};

const difficultyChip: Record<string, { bg: string; color: string; border: string }> = {
  Easy:   { bg: "var(--sage-bg)",  color: "#5C7558",           border: "#CFD9C7" },
  Medium: { bg: "var(--amber-bg)", color: "var(--amber-dark)", border: "#E3CFAE" },
  Hard:   { bg: "var(--clay-bg)",  color: "#8C4B42",           border: "#E3C4BE" },
};

export default async function AdminProblemsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();
  if (!profile?.is_admin) notFound();

  const { data: problems } = await admin
    .from("problems")
    .select("id, title, difficulty, points, is_published, created_at")
    .order("id", { ascending: false })
    .returns<ProblemRow[]>();

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "40px 48px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>admin · {problems?.length ?? 0} problems</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.025em", margin: 0, color: "var(--ink)" }}>
            Problems
          </h1>
        </div>
        <Link href="/admin/problems/new" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px",
          background: "var(--ink)", color: "var(--bg)",
          borderRadius: 999, fontSize: 13.5, fontWeight: 500,
          textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap",
        }}>
          <IconPlus size={15} /> New Problem
        </Link>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "48px 1fr 100px 80px 80px 80px",
          gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--line)",
          fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--muted)",
        }}>
          <span>#</span>
          <span>Title</span>
          <span>Difficulty</span>
          <span style={{ textAlign: "right" }}>Points</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {(problems ?? []).map((p, i) => {
          const chip = difficultyChip[p.difficulty];
          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 100px 80px 80px 80px",
              gap: 12, padding: "16px 20px", alignItems: "center",
              borderBottom: i < (problems ?? []).length - 1 ? "1px solid var(--line-soft)" : "none",
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted-2)" }}>{p.id}</span>
              <Link href={`/problems/${p.id}`} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", textDecoration: "none" }}
                className="admin-title-link"
              >
                {p.title}
              </Link>
              <span style={{
                display: "inline-flex", alignItems: "center",
                padding: "3px 10px", borderRadius: 999,
                fontFamily: "var(--mono)", fontSize: 11,
                background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
                width: "fit-content",
              }}>
                {p.difficulty}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)", textAlign: "right" }}>{p.points}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: p.is_published ? "#5C7558" : "var(--muted)" }}>
                {p.is_published ? "Published" : "Draft"}
              </span>
              <div style={{ textAlign: "right" }}>
                <Link href={`/admin/problems/${p.id}/edit`} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "5px 10px", border: "1px solid var(--line)",
                  borderRadius: 6, fontSize: 11.5,
                  color: "var(--ink-soft)", textDecoration: "none",
                  fontFamily: "var(--mono)",
                }}>
                  <IconEdit size={10} /> Edit
                </Link>
              </div>
            </div>
          );
        })}

        {(problems ?? []).length === 0 && (
          <p style={{ padding: "48px 24px", textAlign: "center", fontSize: 14, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            No problems yet. Create your first one.
          </p>
        )}
      </div>
    </section>
  );
}
