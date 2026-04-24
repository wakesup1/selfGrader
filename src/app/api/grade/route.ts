/**
 * POST /api/grade
 *
 * Thin route handler — validates the request, checks auth, then delegates
 * all business logic to the grading service.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gradeSubmission, recordOfflineSubmission } from "@/services/grading";
import { ratelimit, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const schema = z.object({
  problemId:  z.number().int().positive(),
  code:       z.string().min(1),
  languageId: z.number().int(),
});

export async function POST(request: Request) {
  // 1. Rate limit — 5 submissions / IP / 60-second sliding window
  const ip = getClientIp(request);
  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1_000));
    return NextResponse.json(
      { error: "Too many submissions. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // 2. Parse & validate
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // 3. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Resolve test-case count upfront (needed for the offline fallback).
  const admin = createAdminClient();
  const { count: tcCount } = await admin
    .from("test_cases")
    .select("id", { count: "exact", head: true })
    .eq("problem_id", body.problemId);

  // 4. Grade
  try {
    const result = await gradeSubmission({
      userId:     user.id,
      problemId:  body.problemId,
      code:       body.code,
      languageId: body.languageId,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message     = err instanceof Error ? err.message : "Unknown error";
    const code        = (err as { code?: string }).code;

    if (code === "NOT_FOUND")    return NextResponse.json({ error: "Problem not found" },           { status: 404 });
    if (code === "NO_TEST_CASES") return NextResponse.json({ error: "No test cases for problem" }, { status: 400 });

    // Judge0 offline / network error
    console.error("[/api/grade] Judge0 error:", message);
    await recordOfflineSubmission(
      { userId: user.id, problemId: body.problemId, code: body.code, languageId: body.languageId },
      tcCount ?? 0
    );
    return NextResponse.json(
      { error: "Judge0 server is offline or unreachable", details: message },
      { status: 503 }
    );
  }
}
