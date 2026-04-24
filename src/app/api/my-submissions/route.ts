import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = Number(searchParams.get("problemId"));

  if (!problemId || Number.isNaN(problemId)) {
    return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ submissions: null });
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, status, score, execution_time, memory, created_at, language_id")
    .eq("problem_id", problemId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ submissions: submissions ?? [] });
}
