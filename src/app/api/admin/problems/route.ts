/**
 * POST /api/admin/problems — create a problem with test cases.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createProblem, isAdmin } from "@/services/problems";

export const runtime = "nodejs";

const schema = z.object({
  title:       z.string().min(3),
  description: z.string().default(""),   // optional when PDF is uploaded
  constraints: z.string().default(""),
  difficulty:  z.enum(["Easy", "Medium", "Hard"]),
  points:      z.number().int().positive(),
  time_limit:  z.number().int().positive(),
  memory_limit: z.number().int().positive(),
  testCases: z.array(
    z.object({
      input:           z.string(),
      expected_output: z.string().min(1),
      is_sample:       z.boolean(),
    })
  ).min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = await createProblem({ ...body, createdBy: user.id });
    return NextResponse.json({ message: "Problem created successfully", id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
