/**
 * Upstash Redis-backed rate limiter.
 *
 * Limit: 5 submissions per IP per sliding 60-second window.
 * Used only in server-side API routes — never imported by client components.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: false,
  prefix: "nograder:grade",
});

/**
 * Extract the real client IP from a Next.js Request.
 * Cloudflare Tunnel sets CF-Connecting-IP; fall back to X-Forwarded-For.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
