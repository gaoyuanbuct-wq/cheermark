import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type DbClient = ReturnType<typeof drizzle>;
export type SqlClient = ReturnType<typeof postgres>;

/**
 * Create a fresh per-request postgres + drizzle client.
 * Do NOT cache this across requests — Cloudflare Workers isolates
 * share globalThis across concurrent requests, causing deadlocks.
 *
 * Caller is responsible for calling sql.end() when done.
 */
export function createDbClient(): { db: DbClient; sql: SqlClient } {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = postgres(url, {
    prepare: false,
    max: 1,          // one connection per request is enough
    idle_timeout: 10,
    connect_timeout: 10,
  });

  const db = drizzle(sql);
  return { db, sql };
}
