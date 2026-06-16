import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const generationJobs = pgTable("generation_jobs", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending"), // "pending" | "done" | "failed"
  imageUrl: text("image_url"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GenerationJob = typeof generationJobs.$inferSelect;
export type NewGenerationJob = typeof generationJobs.$inferInsert;
