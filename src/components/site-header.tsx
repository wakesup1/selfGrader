import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--ink)", color: "var(--bg)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1, paddingBottom: 2,
        }}>
          n
        </div>
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
        <NavItem href="/problems">Problems</NavItem>
        <NavItem href="/leaderboard">Leaderboard</NavItem>
        <NavItem href="/submissions">Submissions</NavItem>
        {isAdmin && <NavItem href="/admin/problems" accent>Admin</NavItem>}
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
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
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
      }}
      className="nav-item-hover"
    >
      {children}
    </Link>
  );
}
