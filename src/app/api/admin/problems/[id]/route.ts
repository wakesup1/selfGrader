/**
 * PATCH /api/admin/problems/[id] — update a problem and replace its test cases.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateProblem, isAdmin } from "@/services/problems";

export const runtime = "nodejs";

const schema = z.object({
  title:        z.string().min(3),
  description:  z.string().default(""),  // optional when PDF is uploaded
  constraints:  z.string().default(""),
  difficulty:   z.enum(["Easy", "Medium", "Hard"]),
  points:       z.number().int().positive(),
  time_limit:   z.number().int().positive(),
  memory_limit: z.number().int().positive(),
  is_published: z.boolean().default(true),
  testCases: z.array(
    z.object({
      id:              z.number().int().optional(),
      input:           z.string(),
      expected_output: z.string().min(1),
      is_sample:       z.boolean(),
    })
  ).min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problemId = Number(id);
    if (Number.isNaN(problemId)) {
      return NextResponse.json({ error: "Invalid problem ID" }, { status: 400 });
    }

    const body = schema.parse(await request.json());

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await updateProblem(problemId, body);
    return NextResponse.json({ message: "Problem updated successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
