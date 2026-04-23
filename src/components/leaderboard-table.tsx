import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/types";

export function LeaderboardTable({ rows }: { rows: Profile[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hall of Fame</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 border-b border-zinc-800 pb-2 text-xs uppercase tracking-wide text-zinc-500">
          <span className="col-span-1">#</span>
          <span className="col-span-6">User</span>
          <span className="col-span-3">Score</span>
          <span className="col-span-2">Solved</span>
        </div>
        {rows.map((row, index) => (
          <div key={row.id} className="grid grid-cols-12 border-b border-zinc-900 py-3 text-sm text-zinc-200">
            <span className="col-span-1 text-zinc-500">{index + 1}</span>
            <span className="col-span-6">{row.username}</span>
            <span className="col-span-3 text-cyan-300">{row.total_score}</span>
            <span className="col-span-2 text-zinc-400">{row.solved_count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
