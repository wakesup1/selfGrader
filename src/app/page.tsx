import Link from "next/link";
import { ArrowRight, Trophy, Code2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-cyan-950/40 p-8 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.25),transparent_45%)]" />
        <p className="relative text-sm uppercase tracking-[0.2em] text-cyan-300">Simple Online Judge</p>
        <h1 className="relative mt-2 max-w-2xl text-4xl font-black tracking-tight text-zinc-100 md:text-5xl">
          Practice. Submit. Climb the Hall of Fame.
        </h1>
        <p className="relative mt-4 max-w-xl text-zinc-300">
          Next.js + Supabase + Judge0 stack ready for you and your friends. Build coding habits with instant verdicts and score tracking.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link href="/problems">
            <Button>
              Start Solving <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline">Login / Signup</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-cyan-300" /> Problem Set</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">Browse problems with points, limits, and difficulty levels.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-cyan-300" /> Submissions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">See every attempt, inspect source code, and compare strategies.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-cyan-300" /> Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">Track total score and solved counts in your group hall of fame.</CardContent>
        </Card>
      </div>
    </section>
  );
}
