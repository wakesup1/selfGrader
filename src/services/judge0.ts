/**
 * Judge0 service — all HTTP communication with the Judge0 CE instance.
 *
 * Server-side calls always talk to http://localhost:2358 (set JUDGE0_URL in
 * .env.local).  The public tunnel URL is never used for server-to-server
 * requests; it exists only for client-side informational links if needed.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Judge0Payload = {
  source_code: string;
  language_id: number;
  stdin: string;
  cpu_time_limit: number;
  /** KB — convert from MB before calling */
  memory_limit: number;
};

export type Judge0Result = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  /** Seconds as a string, e.g. "0.042" */
  time: string | null;
  /** KB */
  memory: number | null;
  status: { id: number; description: string };
};

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/** Status IDs 1 (In Queue) and 2 (Processing) — keep polling. */
const PENDING_IDS = new Set([1, 2]);

/**
 * Numeric status → internal verdict code.
 * Full seed list: https://github.com/judge0/judge0/blob/master/db/seeds.rb
 */
const STATUS_MAP: Record<number, string> = {
  3:  "AC",   // Accepted
  4:  "WA",   // Wrong Answer
  5:  "TLE",  // Time Limit Exceeded
  6:  "CE",   // Compilation Error
  7:  "RE",   // Runtime Error (SIGSEGV)
  8:  "RE",   // Runtime Error (SIGXFSZ)
  9:  "RE",   // Runtime Error (SIGFPE)
  10: "RE",   // Runtime Error (SIGABRT)
  11: "RE",   // Runtime Error (NZEC)
  12: "RE",   // Runtime Error (Other)
  13: "RE",   // Internal Error
  14: "ERR",  // Exec Format Error
};

const MAX_POLLS        = 30;
const FETCH_TIMEOUT_MS = 8_000;

/**
 * Adaptive back-off delays (ms) between polls.
 * Fast programs finish in 100–300ms — start polling at 50ms and ramp up
 * gradually rather than hard-sleeping 1 s on every attempt.
 * Index i → delay after the i-th pending response.
 * Beyond the table length the last value (1 000 ms) is used.
 */
const POLL_DELAYS_MS = [50, 100, 150, 200, 250, 300, 400, 500, 750, 1_000];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseUrl(): string {
  // ดึงจาก env ถ้าไม่มีให้ใช้ URL ของ RapidAPI เป็น default ไปเลย
  const url = process.env.JUDGE0_URL ?? "";
  console.log("FINAL URL BEFORE FETCH:", url);
  return url.replace(/\/$/, "");
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Auth-Token": "nograder69", 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*",
  };
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Submit source code to Judge0 and return the submission token. */
export async function submitCode(payload: Judge0Payload): Promise<string> {
  // สร้าง payload ใหม่ที่ encode เป็น base64
  const encodedPayload = {
    ...payload,
    source_code: Buffer.from(payload.source_code).toString("base64"),
    stdin: Buffer.from(payload.stdin || "").toString("base64"),
  };

  const res = await fetch(`${baseUrl()}/submissions?base64_encoded=true&wait=false`, { // เปลี่ยนเป็น true
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify(encodedPayload), // ใช้ตัวที่ encode แล้ว
    signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Judge0 submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

/** Decode base64-encoded text fields returned when ?base64_encoded=true. */
function decodeResult(r: Judge0Result): Judge0Result {
  const b64 = (s: string | null) => {
    if (!s) return s;
    try { return Buffer.from(s, "base64").toString("utf8"); } catch { return s; }
  };
  return { ...r, stdout: b64(r.stdout), stderr: b64(r.stderr), compile_output: b64(r.compile_output) };
}

/** Poll Judge0 until the submission finishes, then return the result. */
export async function pollResult(token: string): Promise<Judge0Result> {
  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(
      `${baseUrl()}/submissions/${token}?base64_encoded=true&fields=*`,
      {
        headers: headers(),
        cache:   "no-store",
        signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Judge0 poll failed (${res.status}): ${body}`);
    }

    const result = (await res.json()) as Judge0Result;

    if (!PENDING_IDS.has(result.status.id)) return decodeResult(result);

    const delay = POLL_DELAYS_MS[Math.min(i, POLL_DELAYS_MS.length - 1)];
    await sleep(delay);
  }

  throw new Error("Judge0 polling timed out after maximum attempts");
}

/** Map a Judge0 result to an internal verdict code (AC / WA / TLE / CE / RE / ERR). */
export function mapVerdict(result: Judge0Result): string {
  const byId = STATUS_MAP[result.status.id];
  if (byId) return byId;

  // Fallback: string match on description (handles unknown/future status IDs).
  const desc = result.status.description.toLowerCase();
  if (desc.includes("accepted"))           return "AC";
  if (desc.includes("wrong answer"))       return "WA";
  if (desc.includes("time limit"))         return "TLE";
  if (desc.includes("compilation error"))  return "CE";
  if (desc.includes("runtime") || desc.includes("segmentation")) return "RE";
  return "ERR";
}
