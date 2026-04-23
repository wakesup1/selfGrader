import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Problem } from "@/lib/types";

const difficultyClasses: Record<Problem["difficulty"], string> = {
  Easy: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  Medium: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  Hard: "border-rose-500/50 bg-rose-500/10 text-rose-300",
};

export function ProblemList({ problems }: { problems: Problem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {problems.map((problem) => (
        <Link key={problem.id} href={`/problems/${problem.id}`}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-cyan-500/60 hover:bg-zinc-900/80">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <CardTitle>{problem.title}</CardTitle>
              <Badge className={difficultyClasses[problem.difficulty]}>{problem.difficulty}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-zinc-400">
              <span>{problem.points} pts</span>
              <span>{problem.time_limit}s / {problem.memory_limit}MB</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
