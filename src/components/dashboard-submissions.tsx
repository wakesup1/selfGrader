import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export async function DashboardSubmissions({ problemId }: { problemId: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        Please login to see your submissions.
      </div>
    );
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, status, score, execution_time, memory, created_at, language_id")
    .eq("problem_id", problemId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        No submissions yet. Run your code to see history here.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-900 border-b border-slate-800">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-slate-300">Time</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
            <TableHead className="text-slate-300 text-right">Score</TableHead>
            <TableHead className="text-slate-300 text-right">Runtime</TableHead>
            <TableHead className="text-slate-300 text-right">Memory</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-900/50">
              <TableCell className="text-sm text-slate-400">
                {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    sub.status === "AC"
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  }
                >
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-slate-200">
                {sub.score}
              </TableCell>
              <TableCell className="text-right text-sm text-slate-400">
                {sub.execution_time ? `${sub.execution_time}s` : "-"}
              </TableCell>
              <TableCell className="text-right text-sm text-slate-400">
                {sub.memory ? `${sub.memory} KB` : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
