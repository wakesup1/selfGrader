/**
 * cafe-grader MySQL sync — pushes problems and test cases into cafe-grader's DB.
 *
 * cafe-grader has no admin REST API for creating/updating problems, so we write
 * directly to its MySQL instance AND write testcase files to the shared Active
 * Storage volume that the Rails app serves.
 *
 * Why files instead of text columns?
 *   The worker (judge_base.rb) downloads testcase data via:
 *     POST /worker/get_attachment/:active_storage_attachment_id
 *   It reads `tc.inp_file.id` and `tc.ans_file.id` — Active Storage attachment IDs.
 *   The `input` and `sol` text columns on `testcases` are legacy and are never read
 *   by the grading engine.
 *
 * Active Storage disk layout (service_name = "local"):
 *   $CAFE_GRADER_STORAGE_PATH / key[0..1] / key[2..3] / key
 *
 * Server-side only. Never import from client components.
 */

import fs   from "fs/promises";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Connection pool
// ---------------------------------------------------------------------------

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:              process.env.CAFE_GRADER_MYSQL_HOST     ?? "localhost",
      port:              Number(process.env.CAFE_GRADER_MYSQL_PORT ?? 3306),
      user:              process.env.CAFE_GRADER_MYSQL_USER     ?? "root",
      password:          process.env.CAFE_GRADER_MYSQL_PASSWORD ?? "",
      database:          process.env.CAFE_GRADER_MYSQL_DB       ?? "grader",
      waitForConnections: true,
      connectionLimit:    5,
    });
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProblemSyncInput = {
  supabaseProblemId:           number;
  existingCafeGraderProblemId: number | null;
  slug:        string;
  title:       string;
  timeLimit:   number;   // seconds
  memoryLimit: number;   // MB
  testCases: Array<{ input: string; expected_output: string }>;
};

// ---------------------------------------------------------------------------
// Active Storage helpers
// ---------------------------------------------------------------------------

/**
 * Return the root directory where Active Storage blob files live.
 * Must match the `root:` value in cafe-grader's config/storage.yml
 * (i.e. Rails.root.join("storage") → mounted at CAFE_GRADER_STORAGE_PATH).
 */
function storageRoot(): string {
  const p = process.env.CAFE_GRADER_STORAGE_PATH;
  if (!p) {
    throw new Error(
      "CAFE_GRADER_STORAGE_PATH is not set. " +
      "Mount the nograder-grader-storage volume into the nograder container " +
      "and set CAFE_GRADER_STORAGE_PATH to its mount point (e.g. /grader-storage)."
    );
  }
  return p;
}

/**
 * Rails ActiveStorage::Service::DiskService key format: base58, 24 chars.
 * Base58 alphabet = 0-9 A-Z a-z minus 0 O I l.
 */
function generateStorageKey(): string {
  const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(24);
  return Array.from(bytes, (b) => ALPHA[b % ALPHA.length]).join("");
}

/**
 * Rails disk service path: root / key[0,2] / key[2,2] / key
 */
function blobFilePath(root: string, key: string): string {
  return path.join(root, key.substring(0, 2), key.substring(2, 4), key);
}

/**
 * Rails uses OpenSSL::Digest::MD5.base64digest(raw_bytes) for the checksum.
 * Equivalent in Node: base64-encoded MD5 of the raw UTF-8 bytes.
 */
function md5Base64(content: string): string {
  return crypto.createHash("md5").update(Buffer.from(content, "utf8")).digest("base64");
}

/**
 * Write a single blob file to the Active Storage directory structure and
 * insert the corresponding `active_storage_blobs` row.
 * Returns the new blob's auto-increment ID.
 */
async function createBlob(
  conn: mysql.PoolConnection,
  root: string,
  filename: string,
  content: string
): Promise<number> {
  const key      = generateStorageKey();
  const buf      = Buffer.from(content, "utf8");
  const byteSize = buf.byteLength;
  const checksum = md5Base64(content);
  const filePath = blobFilePath(root, key);

  // Write file to disk first — if this fails the DB insert won't happen
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buf);

  const [result] = await conn.execute<mysql.ResultSetHeader>(
    `INSERT INTO active_storage_blobs
       (\`key\`, filename, content_type, metadata, service_name, byte_size, checksum, created_at)
     VALUES (?, ?, 'text/plain', '{}', 'local', ?, ?, NOW())`,
    [key, filename, byteSize, checksum]
  );

  return result.insertId;
}

/**
 * Attach a blob to a Testcase record under the given attachment name.
 */
async function attachBlob(
  conn: mysql.PoolConnection,
  name: "inp_file" | "ans_file",
  testcaseId: number,
  blobId: number
): Promise<void> {
  await conn.execute(
    `INSERT INTO active_storage_attachments
       (name, record_type, record_id, blob_id, created_at)
     VALUES (?, 'Testcase', ?, ?, NOW())`,
    [name, testcaseId, blobId]
  );
}

/**
 * Delete all Active Storage attachments + blobs for testcases in a dataset,
 * and attempt to remove the physical blob files (best-effort).
 */
async function cleanupDatasetTestcases(
  conn: mysql.PoolConnection,
  root: string,
  datasetId: number
): Promise<void> {
  // 1. Find all testcase IDs in this dataset
  const [tcRows] = await conn.execute<mysql.RowDataPacket[]>(
    `SELECT id FROM testcases WHERE dataset_id = ?`,
    [datasetId]
  );
  if (tcRows.length === 0) return;

  const tcIds = (tcRows as { id: number }[]).map((r) => r.id);
  const tcPlaceholders = tcIds.map(() => "?").join(",");

  // 2. Find attachment IDs + blob IDs for these testcases
  const [attRows] = await conn.execute<mysql.RowDataPacket[]>(
    `SELECT id, blob_id FROM active_storage_attachments
      WHERE record_type = 'Testcase' AND record_id IN (${tcPlaceholders})`,
    tcIds
  );
  const attIds  = (attRows as { id: number; blob_id: number }[]).map((r) => r.id);
  const blobIds = (attRows as { id: number; blob_id: number }[]).map((r) => r.blob_id);

  // 3. Fetch blob keys so we can delete the files
  let blobKeys: string[] = [];
  if (blobIds.length > 0) {
    const blobPlaceholders = blobIds.map(() => "?").join(",");
    const [blobRows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT \`key\` FROM active_storage_blobs WHERE id IN (${blobPlaceholders})`,
      blobIds
    );
    blobKeys = (blobRows as { key: string }[]).map((r) => r.key);
  }

  // 4. Delete attachments first (FK → blobs), then blobs, then testcases
  if (attIds.length > 0) {
    const attPlaceholders = attIds.map(() => "?").join(",");
    await conn.execute(
      `DELETE FROM active_storage_attachments WHERE id IN (${attPlaceholders})`,
      attIds
    );
  }
  if (blobIds.length > 0) {
    const blobPlaceholders = blobIds.map(() => "?").join(",");
    await conn.execute(
      `DELETE FROM active_storage_blobs WHERE id IN (${blobPlaceholders})`,
      blobIds
    );
  }

  await conn.execute(
    `DELETE FROM testcases WHERE dataset_id = ?`,
    [datasetId]
  );

  // 5. Best-effort: remove physical blob files
  for (const key of blobKeys) {
    try {
      await fs.unlink(blobFilePath(root, key));
    } catch {
      // File may not exist or path may not be writable — ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

/**
 * Upsert a problem and its test cases into cafe-grader's MySQL DB,
 * including Active Storage blob files and attachment records.
 *
 * Returns the cafe-grader problem ID (created or pre-existing).
 * After a successful sync, updates Supabase problems.cafe_grader_problem_id.
 */
export async function syncProblemToCafeGrader(input: ProblemSyncInput): Promise<number> {
  const root = storageRoot();
  const conn = await getPool().getConnection();

  try {
    await conn.beginTransaction();

    // -----------------------------------------------------------------------
    // 1. Upsert problem row
    // -----------------------------------------------------------------------
    const safeName = input.slug.substring(0, 30); // cafe-grader name col limit
    let cafeGraderProblemId: number;

    if (input.existingCafeGraderProblemId !== null) {
      await conn.execute(
        `UPDATE problems
            SET full_name = ?, available = 1, updated_at = NOW()
          WHERE id = ?`,
        [input.title, input.existingCafeGraderProblemId]
      );
      cafeGraderProblemId = input.existingCafeGraderProblemId;
    } else {
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO problems
           (name, full_name, full_score, available, date_added, task_type, compilation_type)
         VALUES (?, ?, 100, 1, CURDATE(), 0, 0)`,
        [safeName, input.title]
      );
      cafeGraderProblemId = result.insertId;
    }

    // -----------------------------------------------------------------------
    // 2. Upsert dataset row  (one "main" dataset per problem)
    // -----------------------------------------------------------------------
    let datasetId: number;

    const [existingDatasets] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT id FROM datasets WHERE problem_id = ? AND name = 'main' LIMIT 1`,
      [cafeGraderProblemId]
    );

    if (existingDatasets.length > 0) {
      datasetId = (existingDatasets[0] as { id: number }).id;
      await conn.execute(
        `UPDATE datasets
            SET time_limit = ?, memory_limit = ?, updated_at = NOW()
          WHERE id = ?`,
        [input.timeLimit, input.memoryLimit, datasetId]
      );
    } else {
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO datasets
           (problem_id, name, time_limit, memory_limit, score_type, evaluation_type, created_at, updated_at)
         VALUES (?, 'main', ?, ?, 0, 0, NOW(), NOW())`,
        [cafeGraderProblemId, input.timeLimit, input.memoryLimit]
      );
      datasetId = result.insertId;
    }

    // -----------------------------------------------------------------------
    // 3. Delete old testcases + their Active Storage records + blob files
    // -----------------------------------------------------------------------
    await cleanupDatasetTestcases(conn, root, datasetId);

    // -----------------------------------------------------------------------
    // 4. Insert new testcases with Active Storage blobs + attachments
    // -----------------------------------------------------------------------
    for (let i = 0; i < input.testCases.length; i++) {
      const tc = input.testCases[i];

      // Insert testcase row (input/sol columns kept for reference but unused by worker)
      const [tcResult] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO testcases
           (problem_id, dataset_id, num, weight, input, sol, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, ?, NOW(), NOW())`,
        [cafeGraderProblemId, datasetId, i + 1, tc.input, tc.expected_output]
      );
      const testcaseId = tcResult.insertId;

      // Create Active Storage blobs + attachments for inp_file and ans_file
      const inpBlobId = await createBlob(conn, root, `tc${i + 1}_input.txt`,  tc.input);
      const ansBlobId = await createBlob(conn, root, `tc${i + 1}_output.txt`, tc.expected_output);

      await attachBlob(conn, "inp_file", testcaseId, inpBlobId);
      await attachBlob(conn, "ans_file", testcaseId, ansBlobId);
    }

    // -----------------------------------------------------------------------
    // 5. Point problem to the live dataset
    // -----------------------------------------------------------------------
    await conn.execute(
      `UPDATE problems SET live_dataset_id = ? WHERE id = ?`,
      [datasetId, cafeGraderProblemId]
    );

    await conn.commit();

    // -----------------------------------------------------------------------
    // 6. Persist cafe_grader_problem_id back to Supabase
    // -----------------------------------------------------------------------
    const admin = createAdminClient();
    await admin
      .from("problems")
      .update({ cafe_grader_problem_id: cafeGraderProblemId })
      .eq("id", input.supabaseProblemId);

    return cafeGraderProblemId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
