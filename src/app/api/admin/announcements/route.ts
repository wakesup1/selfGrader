import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/services/problems";

export const runtime = "nodejs";

const schema = z.object({
  tag:          z.string().min(1).max(30).default("Info"),
  title:        z.string().min(1).max(120),
  body:         z.string().max(2000).default(""),
  pinned:       z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = schema.parse(await request.json());
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("announcements")
    .insert({ ...body, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
