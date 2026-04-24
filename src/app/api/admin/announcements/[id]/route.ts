import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/services/problems";

export const runtime = "nodejs";

const schema = z.object({
  tag:          z.string().min(1).max(30).optional(),
  title:        z.string().min(1).max(120).optional(),
  body:         z.string().max(2000).optional(),
  pinned:       z.boolean().optional(),
  is_published: z.boolean().optional(),
});

async function guard(userId: string) {
  if (!(await isAdmin(userId))) throw new Error("Forbidden");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try { await guard(user.id); } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = schema.parse(await request.json());
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("announcements")
    .update(body)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try { await guard(user.id); } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("announcements").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
