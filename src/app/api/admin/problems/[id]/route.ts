import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  constraints: z.string().default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number().int().positive(),
  time_limit: z.number().int().positive(),
  memory_limit: z.number().int().positive(),
  is_published: z.boolean().default(true),
  testCases: z
    .array(
      z.object({
        id: z.number().int().optional(),
        input: z.string(),
        expected_output: z.string().min(1),
        is_sample: z.boolean(),
      }),
    )
    .min(1),
});

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single<{ is_admin: boolean }>();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update problem and delete test cases in parallel (insert must follow delete)
    const [{ error: updateError }, { error: deleteError }] = await Promise.all([
      admin
        .from("problems")
        .update({
          title: body.title,
          description: body.description,
          constraints: body.constraints,
          difficulty: body.difficulty,
          points: body.points,
          time_limit: body.time_limit,
          memory_limit: body.memory_limit,
          is_published: body.is_published,
        })
        .eq("id", problemId),
      admin.from("test_cases").delete().eq("problem_id", problemId),
    ]);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    const { error: insertError } = await admin.from("test_cases").insert(
      body.testCases.map((tc) => ({
        problem_id: problemId,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample,
      })),
    );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Problem updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
