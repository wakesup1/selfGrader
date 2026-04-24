import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. สร้าง Response ก้อนเดียวที่จะใช้ส่งออกไปจริงๆ
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: apply updated cookies to the request so Server Components
          // see the refreshed session immediately.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Step 2: CRITICAL — re-create the response from the now-mutated
          // request object so the refreshed session cookies are included in
          // the response sent back to the browser.  Without this re-assignment
          // the new cookies are lost and users get randomly logged out.
          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 4. สำคัญมาก: เรียก getUser() เพื่อเช็ค Session
  // ถ้าหมดอายุ มันจะวิ่งไปทำงานใน setAll ข้างบนให้เอง
  await supabase.auth.getUser();

  return supabaseResponse;
}