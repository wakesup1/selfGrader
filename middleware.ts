import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. เพิ่มเงื่อนไขข้ามการทำงานสำหรับไฟล์ภายในของ Next.js และ WebSocket
  if (
    request.nextUrl.pathname.startsWith('/_next') || 
    request.nextUrl.pathname.includes('/api/') ||
    request.headers.get('upgrade') === 'websocket' // ป้องกัน HMR พังบน Cloudflare
  ) {
    return; 
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * ปรับ Matcher ให้ข้ามไฟล์จุกจิกทั้งหมด
     * รวมถึงพวกไฟล์นามสกุลต่างๆ เพื่อให้ Middleware ไม่ทำงานหนักเกินไป
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};