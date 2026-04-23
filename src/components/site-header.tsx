import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const serverClient = await createClient();
    await serverClient.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-cyan-300">
          Simple OJ
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/problems" className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Problems
          </Link>
          <Link href="/leaderboard" className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Leaderboard
          </Link>
          <Link href="/submissions" className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Submissions
          </Link>
          <Link href="/admin/problems/new" className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            Admin
          </Link>
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="outline" className="ml-1">
                Sign out
              </Button>
            </form>
          ) : (
            <div className="ml-1 flex items-center gap-2">
              <Link href="/auth?mode=login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
