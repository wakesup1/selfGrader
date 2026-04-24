/**
 * POST /api/admin/problems/[id]/pdf
 * Accepts multipart/form-data with field "pdf" (application/pdf, max 10 MB).
 * Uploads to Supabase Storage bucket "problem-pdfs", then stores the public
 * URL in problems.pdf_url.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/services/problems";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const problemId = Number(id);
  if (Number.isNaN(problemId)) {
    return NextResponse.json({ error: "Invalid problem ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Field 'pdf' must be a PDF file" }, { status: 400 });
  }

  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const admin = createAdminClient();
  const storagePath = `problems/${problemId}.pdf`;

  // Upload (upsert so re-uploads replace the existing file)
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from("problem-pdfs")
    .upload(storagePath, arrayBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get the permanent public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("problem-pdfs").getPublicUrl(storagePath);

  // Persist on the problem row
  const { error: updateError } = await admin
    .from("problems")
    .update({ pdf_url: publicUrl })
    .eq("id", problemId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ pdf_url: publicUrl });
}

/**
 * DELETE /api/admin/problems/[id]/pdf
 * Removes the stored PDF and clears pdf_url on the problem row.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const problemId = Number(id);
  if (Number.isNaN(problemId)) {
    return NextResponse.json({ error: "Invalid problem ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  await admin.storage.from("problem-pdfs").remove([`problems/${problemId}.pdf`]);

  const { error } = await admin
    .from("problems")
    .update({ pdf_url: null })
    .eq("id", problemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
