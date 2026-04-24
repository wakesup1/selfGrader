/**
 * GET /api/problems/[id]/pdf
 *
 * Proxies the problem PDF from Supabase Storage through the same origin.
 * Browsers block cross-origin <iframe> PDF embeds; routing through here
 * makes it same-origin so the iframe renders normally in all browsers.
 *
 * Authenticated admins can preview unpublished problems.
 * Everyone else only sees published problems.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/services/problems";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const problemId = Number(id);
  if (Number.isNaN(problemId)) {
    return new Response("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminAccess = user ? await isAdmin(user.id) : false;

  // Build query — admins bypass RLS so they can preview drafts
  const dbClient = adminAccess ? createAdminClient() : supabase;
  let q = dbClient.from("problems").select("pdf_url").eq("id", problemId);
  if (!adminAccess) q = q.eq("is_published", true);

  const { data: problem } = await q.single<{ pdf_url: string | null }>();

  if (!problem?.pdf_url) {
    return new Response("No PDF for this problem", { status: 404 });
  }

  // Fetch the file from Supabase Storage server-side.
  // Do NOT pass { next: { revalidate } } — it caches the body stream and
  // exhausts it on the first read, leaving subsequent requests with an empty
  // response.  Use cache: "no-store" so every request gets a fresh body.
  let upstream: Response;
  try {
    upstream = await fetch(problem.pdf_url, { cache: "no-store" });
  } catch (err) {
    console.error("[pdf-proxy] fetch error:", err);
    return new Response("Failed to fetch PDF", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(`Storage returned ${upstream.status}`, { status: 502 });
  }

  // Buffer the entire PDF so the body can't be consumed mid-stream.
  const buffer = await upstream.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      // Let the browser cache it for 5 min; CDN/proxy can cache for 1 hour.
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
