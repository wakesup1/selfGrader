import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IconMenu, IconReceipt, IconTrophyMug, IconPen, IconChart } from "@/components/icons";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let username: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single<{ username: string; is_admin: boolean }>();
    isAdmin = profile?.is_admin ?? false;
    username = profile?.username ?? null;
  }

  const initial = username ? username[0].toUpperCase() : "?";

  async function signOut() {
    "use server";
    const serverClient = await createClient();
    await serverClient.auth.signOut();
    redirect("/");
  }

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "var(--surface)",
      borderBottom: "1px solid var(--line)",
      padding: "0 40px",
      height: 68,
      display: "flex",
      alignItems: "center",
      gap: 40,
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="20" fill="var(--ink)" />
          <g stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85">
            <path className="steam-path" d="M15 11 C 14 9, 16 8, 15 6" />
            <path className="steam-path" d="M20 11 C 19 9, 21 8, 20 6" />
            <path className="steam-path" d="M25 11 C 24 9, 26 8, 25 6" />
          </g>
          <path d="M11 15 h15 v8 a5 5 0 0 1 -5 5 h-5 a5 5 0 0 1 -5 -5 z" fill="var(--bg)" />
          <path d="M26 17 a3 3 0 0 1 0 6" stroke="var(--bg)" strokeWidth="1.6" fill="none" />
        </svg>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--ink)" }}>
            nograder
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginTop: 1 }}>
            cafe · grade · chill
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4, marginLeft: 4 }}>
        <NavItem href="/problems" icon={<IconMenu size={14} />}>Problems</NavItem>
        <NavItem href="/leaderboard" icon={<IconTrophyMug size={14} />}>Leaderboard</NavItem>
        <NavItem href="/submissions" icon={<IconReceipt size={14} />}>Submissions</NavItem>
        {isAdmin && <NavItem href="/admin/problems" accent icon={<IconPen size={14} />}>Admin</NavItem>}
        {isAdmin && <NavItem href="/admin/stats" accent icon={<IconChart size={14} />}>Stats</NavItem>}
      </nav>

      {/* Right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {username && (
              <Link
                href={`/profile/${encodeURIComponent(username)}`}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 12px 6px 6px",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  fontSize: 13,
                  color: "var(--ink)",
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--amber), var(--sage))",
                  display: "grid", placeItems: "center",
                  color: "white", fontSize: 11, fontWeight: 600,
                  fontFamily: "var(--serif)",
                }}>
                  {initial}
                </div>
                {username}
              </Link>
            )}
            <form action={signOut}>
              <button type="submit" style={{
                padding: "7px 16px",
                border: "1px solid var(--line)",
                borderRadius: 999,
                fontSize: 12.5,
                fontFamily: "var(--sans)",
                color: "var(--ink-soft)",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}>
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/auth?mode=login" style={{
              padding: "7px 16px",
              border: "1px solid var(--line)",
              borderRadius: 999,
              fontSize: 13,
              color: "var(--ink-soft)",
            }}>
              Login
            </Link>
            <Link href="/auth?mode=signup" style={{
              padding: "7px 18px",
              background: "var(--ink)",
              borderRadius: 999,
              fontSize: 13,
              color: "var(--bg)",
              fontWeight: 500,
            }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NavItem({
  href,
  children,
  accent,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "7px 14px",
        fontSize: 14,
        borderRadius: 999,
        color: accent ? "var(--clay)" : "var(--ink-soft)",
        transition: "all 0.15s",
        fontWeight: accent ? 500 : 400,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
      className="nav-item-hover"
    >
      {icon}
      {children}
    </Link>
  );
}
