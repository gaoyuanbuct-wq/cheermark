/**
 * Persistent job store backed by Postgres via Drizzle.
 * Cross-isolate safe — works on Cloudflare Workers.
 */

import { db } from "@/db";
import { generationJobs } from "@/db/schemas/generation-jobs";
import { eq, lt } from "drizzle-orm";

export type JobStatus = "pending" | "done" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  imageUrl?: string;
  error?: string;
  createdAt: number;
}

const TTL_MS = 10 * 60 * 1000; // 10 min

/** Purge jobs older than TTL (best-effort, fire-and-forget). */
function purgeOld() {
  const cutoff = new Date(Date.now() - TTL_MS);
  db.delete(generationJobs)
    .where(lt(generationJobs.createdAt, cutoff))
    .catch(() => { /* silent */ });
}

export async function createJob(id: string): Promise<Job> {
  purgeOld();
  await db.insert(generationJobs).values({ id, status: "pending" });
  return { id, status: "pending", createdAt: Date.now() };
}

export async function getJob(id: string): Promise<Job | undefined> {
  const rows = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    status: row.status as JobStatus,
    imageUrl: row.imageUrl ?? undefined,
    error: row.error ?? undefined,
    createdAt: row.createdAt.getTime(),
  };
}

export async function updateJob(id: string, patch: { status?: JobStatus; imageUrl?: string; error?: string }): Promise<void> {
  await db
    .update(generationJobs)
    .set(patch)
    .where(eq(generationJobs.id, id));
}
