/**
 * cafe-grader HTTP client — replaces judge0.ts
 *
 * Auth:   POST /api/v1/auth/login → JWT (7-day TTL, cached in memory)
 * Submit: POST /api/v1/problems/:id/submissions { source, language_id, filename }
 * Poll:   GET  /api/v1/submissions/:id (until done / terminal status)
 *
 * Server-side only. Never import from client components.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CafeSubmitResponse = {
  id: number;
  number: number;
  status: string;
};

export type CafeEvaluation = {
  testcase_id: number;
  /**
   * Rails enum name:
   * "waiting" | "correct" | "wrong" | "partial" |
   * "time_limit" | "memory_limit" | "crash" |
   * "unknown_error" | "grader_error"
   */
  result: string | null;
  score: number | null;
  /** Milliseconds */
  time: number | null;
  /** Bytes */
  memory: number | null;
};

export type CafeSubmission = {
  id: number;
  problem_id: number;
  /**
   * Rails enum name:
   * "submitted" | "evaluating" | "done" |
   * "compilation_error" | "compilation_success" | "grader_error"
   */
  status: string;
  points: number | null;
  grader_comment: string | null;
  compiler_message: string | null;
  /** Seconds */
  max_runtime: number | null;
  /** Bytes */
  peak_memory: number | null;
  evaluations: CafeEvaluation[];
};

// ---------------------------------------------------------------------------
// Module-level singletons (live for the server process lifetime)
// ---------------------------------------------------------------------------

let cachedToken: { token: string; expiresAt: number } | null = null;
let languageMapCache: Map<number, number> | null = null;

const MAX_POLLS        = 60;
const POLL_INTERVAL_MS = 1_000;
const FETCH_TIMEOUT_MS = 10_000;

/**
 * NoGrader language ID → filename sent to cafe-grader.
 * Java: class name must match the filename, so "Main.java" maps to "public class Main".
 */
const LANG_FILENAME: Record<number, string> = {
  71: "solution.py",   // Python 3
  54: "solution.cpp",  // C++17
  62: "Main.java",     // Java 17
};

/**
 * NoGrader language ID → cafe-grader language.name
 * (used to look up the cafe-grader integer ID via GET /api/v1/languages).
 */
const LANG_NAME: Record<number, string> = {
  71: "python",
  54: "cpp",
  62: "java",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseUrl(): string {
  return (process.env.CAFE_GRADER_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function bearerHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt) {
    console.log("[cafeGrader] getAuthToken: using cached token (expires in",
      Math.round((cachedToken.expiresAt - now) / 1000 / 60), "min)");
    return cachedToken.token;
  }

  const url = `${baseUrl()}/api/v1/auth/login`;
  const login = process.env.CAFE_GRADER_ADMIN_LOGIN ?? "root";
  console.log(`[cafeGrader] getAuthToken: POST ${url} (login="${login}")`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        password: process.env.CAFE_GRADER_ADMIN_PASSWORD ?? "",
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[cafeGrader] getAuthToken: fetch threw:", err);
    throw err;
  }

  console.log(`[cafeGrader] getAuthToken: response status=${res.status} ok=${res.ok}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[cafeGrader] getAuthToken: login failed. body=${body}`);
    throw new Error(`cafe-grader auth failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { token: string };
  console.log(`[cafeGrader] getAuthToken: got token (first 20 chars): ${data.token?.slice(0, 20)}…`);

  // Tokens expire in 7 days — cache for 6 days to be safe
  cachedToken = { token: data.token, expiresAt: now + 6 * 24 * 60 * 60 * 1_000 };
  return cachedToken.token;
}

// ---------------------------------------------------------------------------
// Language map
// ---------------------------------------------------------------------------

export async function getLanguageMap(): Promise<Map<number, number>> {
  if (languageMapCache) {
    console.log("[cafeGrader] getLanguageMap: using cached map", Object.fromEntries(languageMapCache));
    return languageMapCache;
  }

  const token = await getAuthToken();
  const url = `${baseUrl()}/api/v1/languages`;
  console.log(`[cafeGrader] getLanguageMap: GET ${url}`);

  const res = await fetch(url, {
    headers: bearerHeaders(token),
    signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  console.log(`[cafeGrader] getLanguageMap: response status=${res.status}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[cafeGrader] getLanguageMap: failed. body=${body}`);
    throw new Error(`cafe-grader /languages failed (${res.status})`);
  }

  const languages = (await res.json()) as Array<{ id: number; name: string; ext: string }>;
  console.log("[cafeGrader] getLanguageMap: available languages from cafe-grader:", languages);

  const map = new Map<number, number>();

  for (const [noGraderIdStr, cafeName] of Object.entries(LANG_NAME)) {
    const match = languages.find((l) => l.name === cafeName);
    if (match) {
      map.set(Number(noGraderIdStr), match.id);
      console.log(`[cafeGrader] getLanguageMap: mapped noGraderId=${noGraderIdStr} → cafeId=${match.id} (name="${cafeName}")`);
    } else {
      console.warn(`[cafeGrader] getLanguageMap: NO MATCH for cafeName="${cafeName}" (noGraderId=${noGraderIdStr})`);
      console.warn("[cafeGrader] getLanguageMap: available names:", languages.map((l) => l.name));
    }
  }

  languageMapCache = map;
  return map;
}

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

export async function submitCode(
  cafeGraderProblemId: number,
  code: string,
  noGraderLanguageId: number
): Promise<number> {
  console.log(`[cafeGrader] submitCode: cafeGraderProblemId=${cafeGraderProblemId} noGraderLanguageId=${noGraderLanguageId} codeLength=${code.length}`);

  const [token, langMap] = await Promise.all([getAuthToken(), getLanguageMap()]);

  const cafeLanguageId = langMap.get(noGraderLanguageId);
  if (!cafeLanguageId) {
    console.error(`[cafeGrader] submitCode: no cafe-grader language mapping for noGraderLanguageId=${noGraderLanguageId}`);
    console.error("[cafeGrader] submitCode: current langMap:", Object.fromEntries(langMap));
    throw new Error(`No cafe-grader mapping for NoGrader language ID ${noGraderLanguageId}`);
  }

  const filename = LANG_FILENAME[noGraderLanguageId] ?? "solution.cpp";
  const url = `${baseUrl()}/api/v1/problems/${cafeGraderProblemId}/submissions`;
  const requestBody = {
    source:      code,
    language_id: cafeLanguageId,
    filename,
  };

  console.log(`[cafeGrader] submitCode: POST ${url}`);
  console.log("[cafeGrader] submitCode: request body (code truncated):", {
    ...requestBody,
    source: code.slice(0, 200) + (code.length > 200 ? `… (${code.length} chars total)` : ""),
  });

  let res: Response;
  try {
    res = await fetch(url, {
      method:  "POST",
      headers: bearerHeaders(token),
      body:    JSON.stringify(requestBody),
      signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[cafeGrader] submitCode: fetch threw:", err);
    throw err;
  }

  console.log(`[cafeGrader] submitCode: response status=${res.status} ok=${res.ok}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[cafeGrader] submitCode: failed. body=${body}`);
    throw new Error(`cafe-grader submit failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as CafeSubmitResponse;
  console.log("[cafeGrader] submitCode: success, submission:", data);
  return data.id;
}

// ---------------------------------------------------------------------------
// Poll
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES = new Set(["done", "compilation_error", "grader_error"]);

export async function pollResult(cafeSubmissionId: number): Promise<CafeSubmission> {
  const token = await getAuthToken();
  const url = `${baseUrl()}/api/v1/submissions/${cafeSubmissionId}`;

  console.log(`[cafeGrader] pollResult: starting poll for submissionId=${cafeSubmissionId} (max ${MAX_POLLS} attempts)`);

  for (let i = 0; i < MAX_POLLS; i++) {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: bearerHeaders(token),
        cache:   "no-store",
        signal:  AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      console.error(`[cafeGrader] pollResult: attempt ${i + 1} fetch threw:`, err);
      throw err;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[cafeGrader] pollResult: attempt ${i + 1} HTTP error status=${res.status} body=${body}`);
      throw new Error(`cafe-grader poll failed (${res.status}): ${body}`);
    }

    const submission = (await res.json()) as CafeSubmission;

    console.log(`[cafeGrader] pollResult: attempt ${i + 1} → status="${submission.status}"` +
      (submission.grader_comment ? ` grader_comment="${submission.grader_comment}"` : "") +
      (submission.compiler_message ? ` compiler_message="${submission.compiler_message?.slice(0, 120)}"` : "")
    );

    if (TERMINAL_STATUSES.has(submission.status)) {
      console.log(`[cafeGrader] pollResult: terminal status reached after ${i + 1} poll(s)`);
      console.log("[cafeGrader] pollResult: final submission:", JSON.stringify({
        id:               submission.id,
        status:           submission.status,
        points:           submission.points,
        grader_comment:   submission.grader_comment,
        compiler_message: submission.compiler_message,
        max_runtime:      submission.max_runtime,
        peak_memory:      submission.peak_memory,
        evaluations:      submission.evaluations,
      }, null, 2));
      return submission;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  console.error(`[cafeGrader] pollResult: timed out after ${MAX_POLLS} attempts`);
  throw new Error("cafe-grader polling timed out after maximum attempts");
}

// ---------------------------------------------------------------------------
// Verdict mapping
// ---------------------------------------------------------------------------

type InternalVerdict = "AC" | "WA" | "TLE" | "RE" | "CE" | "ERR";

function evalResultToVerdict(result: string | null): InternalVerdict {
  switch (result) {
    case "correct":       return "AC";
    case "wrong":         return "WA";
    case "partial":       return "WA";   // NoGrader has no partial credit
    case "time_limit":    return "TLE";
    case "memory_limit":  return "RE";
    case "crash":         return "RE";
    case "unknown_error": return "ERR";
    case "grader_error":  return "ERR";
    default:              return "WA";
  }
}

/**
 * Convert a completed CafeSubmission to a NoGrader verdict code.
 * Mirrors the "first failure sets the verdict" logic in the old judge0 grading path.
 */
export function mapVerdict(submission: CafeSubmission): string {
  console.log(`[cafeGrader] mapVerdict: status="${submission.status}" evaluations=${submission.evaluations.length}`);

  if (submission.status === "compilation_error") {
    console.log("[cafeGrader] mapVerdict: → CE");
    return "CE";
  }
  if (submission.status === "grader_error" && submission.evaluations.length === 0) {
    console.log(`[cafeGrader] mapVerdict: → ERR (grader_error with no evaluations, grader_comment="${submission.grader_comment}")`);
    return "ERR";
  }
  if (submission.status === "grader_error") {
    console.log(`[cafeGrader] mapVerdict: grader_error but ${submission.evaluations.length} evaluations present — treating as done`);
  }

  // Sort by testcase_id so the verdict reflects TC order, not insertion order.
  const sorted = [...submission.evaluations].sort((a, b) => a.testcase_id - b.testcase_id);

  for (const ev of sorted) {
    const v = evalResultToVerdict(ev.result);
    console.log(`[cafeGrader] mapVerdict: tc_id=${ev.testcase_id} result="${ev.result}" → ${v}`);
    if (v !== "AC") {
      console.log(`[cafeGrader] mapVerdict: first failure at tc_id=${ev.testcase_id} → ${v}`);
      return v;
    }
  }

  console.log("[cafeGrader] mapVerdict: → AC (all evaluations passed)");
  return "AC";
}

/**
 * Build per-TC pass/fail and time arrays from a completed submission.
 * Evaluations are sorted by testcase_id for consistent display.
 */
export function buildResultArrays(submission: CafeSubmission): {
  results: ("pass" | "fail")[];
  times:   (number | null)[];
  maxTimeSec: number;
  maxMemoryKb: number;
} {
  const sorted = [...submission.evaluations].sort((a, b) => a.testcase_id - b.testcase_id);

  const results: ("pass" | "fail")[] = [];
  const times:   (number | null)[]   = [];
  let maxTimeSec  = 0;
  let maxMemoryKb = 0;

  for (const ev of sorted) {
    results.push(ev.result === "correct" ? "pass" : "fail");
    const timeSec = ev.time !== null ? ev.time / 1_000 : null;
    times.push(timeSec);
    maxTimeSec  = Math.max(maxTimeSec,  timeSec                    ?? 0);
    maxMemoryKb = Math.max(maxMemoryKb, (ev.memory ?? 0) / 1_024);
  }

  return { results, times, maxTimeSec, maxMemoryKb };
}
