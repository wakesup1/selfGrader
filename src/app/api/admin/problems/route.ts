import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSlug } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  constraints: z.string().default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number().int().positive(),
  time_limit: z.number().int().positive(),
  memory_limit: z.number().int().positive(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expected_output: z.string().min(1),
        is_sample: z.boolean(),
      }),
    )
    .min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const slug = createSlug(body.title);

    const { data: problem, error: problemError } = await admin
      .from("problems")
      .insert({
        title: body.title,
        slug,
        description: body.description,
        constraints: body.constraints,
        difficulty: body.difficulty,
        points: body.points,
        time_limit: body.time_limit,
        memory_limit: body.memory_limit,
        created_by: user.id,
      })
      .select("id")
      .single<{ id: number }>();

    if (problemError || !problem) {
      return NextResponse.json({ error: problemError?.message ?? "Failed to create problem" }, { status: 400 });
    }

    const { error: testCaseError } = await admin.from("test_cases").insert(
      body.testCases.map((testCase) => ({
        problem_id: problem.id,
        input: testCase.input,
        expected_output: testCase.expected_output,
        is_sample: testCase.is_sample,
      })),
    );

    if (testCaseError) {
      return NextResponse.json({ error: testCaseError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Problem created successfully", id: problem.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
