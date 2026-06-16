import { NextRequest, NextResponse } from "next/server";
import { createDbClient, type DbClient, type SqlClient } from "@/db";
import { createJob, updateJob } from "@/lib/cheermark/job-store";
import { buildComicPrompt } from "@/lib/cheermark/prompt-styles";

/** Cloudflare ExecutionContext — only available on Workers runtime. */
async function getWaitUntil(): Promise<((p: Promise<unknown>) => void) | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { ctx } = await getCloudflareContext({ async: true });
    return ctx.waitUntil.bind(ctx);
  } catch {
    return null;
  }
}

const REACTUS_BASE_URL = process.env.REACTUS_BASE_URL ?? "";
const API_KEY = process.env.HAPPYSEEDS_KEY ?? "";
const PROJECT_ID = process.env.HAPPYSEEDS_PROJECT_ID ?? "";
const MODEL = "doubao-seedream-5-0-260128";

const HEX_NAMES: Record<string, string> = {
  "#009C3B": "green", "#FFDF00": "yellow", "#002776": "deep blue",
  "#000000": "black", "#DD0000": "red", "#FFCE00": "golden yellow",
  "#002395": "blue", "#FFFFFF": "white", "#ED2939": "red",
  "#CE1124": "red", "#AA151B": "crimson red", "#F1BF00": "gold",
  "#74ACDF": "sky blue", "#009246": "green", "#CE2B37": "red",
  "#006600": "dark green", "#FF0000": "red",
  "#AE1C28": "red", "#21468B": "blue",
  "#B22234": "red", "#3C3B6E": "navy blue",
  "#006847": "dark green", "#CE1126": "red", "#BC002D": "crimson",
};

function colorLabel(colors: string[]): string {
  return colors.slice(0, 2).map(c => HEX_NAMES[c] ?? c).join(" and ");
}

function buildPrompt(payload: Record<string, unknown>): string {
  const landmark = payload.landmark as { name: string; city: string; promptHint: string };
  const homeCountry = payload.homeCountry as { name: string; code: string; colors?: string[] };
  const awayCountry = payload.awayCountry as { name: string; code: string; colors?: string[] };
  const homeScore = payload.homeScore as number;
  const awayScore = payload.awayScore as number;
  const effects = payload.effects as string[];
  const slogan = payload.slogan as string;
  const mode = payload.mode as string;
  const pageStyle = payload.pageStyle as string | undefined;
  const winnerCountryId = payload.winnerCountryId as string;
  const homeCountryId = payload.homeCountryId as string;
  const winnerMascot = (payload.winnerMascot as string | undefined) ?? "a cute animal mascot";

  const winner = winnerCountryId === homeCountryId ? homeCountry : awayCountry;
  const scoreStr = `${homeCountry.code} ${homeScore} - ${awayScore} ${awayCountry.code}`;
  const isComic = pageStyle === "comic";
  const winnerColors = colorLabel(winner.colors ?? []);
  const colorTheme = winnerColors
    ? `The entire scene is bathed in ${winnerColors} lighting — these are the winner's national colors dominating the landmark.`
    : "";

  const effectDescriptions: Record<string, string> = isComic ? {
    "light-projection": "bold comic-style light beams projecting the score onto the landmark",
    "led-string": "cartoon LED string lights with glowing bulbs spelling out the score",
    "fireworks": "hand-drawn manga fireworks bursting around the landmark",
  } : {
    "light-projection": "giant light projection of the score on the landmark surface",
    "led-string": "LED string lights spelling out the score draped across the landmark",
    "fireworks": "spectacular fireworks exploding around the landmark",
  };
  const effectDesc = effects.map(e => effectDescriptions[e] ?? e).join(", ");
  const moodDesc = mode === "celebrate"
    ? `celebratory, triumphant, euphoric atmosphere for ${winner.name} fans`
    : `dramatic, taunting, roast atmosphere, mocking the losing team`;

  if (isComic) {
    return buildComicPrompt({ landmark, winnerColors, colorTheme, effectDesc, scoreStr, slogan, moodDesc, winnerMascot });
  }

  return [
    `Epic cinematic NIGHT scene, set after dark, deep black sky full of stars: ${landmark.promptHint}.`,
    colorTheme,
    `The landmark is dramatically illuminated with ${winnerColors} colored spotlights and ${effectDesc}.`,
    `The scoreline "${scoreStr}" is projected in giant glowing ${winnerColors} numbers DIRECTLY ONTO`,
    `the facade and surface of the landmark itself — light-mapped onto the architecture, NOT on a sign or board on the ground.`,
    `The slogan "${slogan}" is also inscribed in glowing ${winnerColors} light across the landmark's surface.`,
    `Mood: ${moodDesc}.`,
    `Photorealistic, ultra high detail, night photography, long exposure, dramatic ${winnerColors} light trails,`,
    `architectural light projection mapping, city lights in background, 4K quality, purely nighttime.`,
  ].join(" ");
}

async function callImageApi(prompt: string): Promise<string> {
  const res = await fetch(`${REACTUS_BASE_URL}/v1/llm_server`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "x-bty-app": PROJECT_ID,
      "x-bty-model": MODEL,
    },
    body: JSON.stringify({ model: MODEL, prompt, size: "1440x2560", output_format: "png", watermark: false }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`upstream ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const url: string | undefined = data?.data?.[0]?.url;
  if (!url) throw new Error("No image URL in response");
  return url;
}

async function persistToOss(rawUrl: string): Promise<string> {
  try {
    const ossRes = await fetch(`${REACTUS_BASE_URL}/v1/llm_server/file_dump_to_oss`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify({ project_id: PROJECT_ID, url: rawUrl }),
      signal: AbortSignal.timeout(15_000),
    });
    if (ossRes.ok) {
      const d = await ossRes.json();
      if (d?.data) return d.data;
    }
  } catch { /* best-effort */ }
  return rawUrl;
}

/**
 * Background job: runs inside waitUntil — connection lifecycle follows the work,
 * not the HTTP response. sql.end() is called in finally so the connection is
 * always released even if generation fails.
 */
async function runJob(
  db: DbClient,
  sql: SqlClient,
  jobId: string,
  payload: Record<string, unknown>,
) {
  const prompt = buildPrompt(payload);
  let lastError = "";

  try {
    // Attempt up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawUrl = await callImageApi(prompt);
        const finalUrl = await persistToOss(rawUrl);
        await updateJob(db, jobId, { status: "done", imageUrl: finalUrl });
        return;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    await updateJob(db, jobId, { status: "failed", error: lastError });
  } finally {
    // Always release the connection after the job completes (or fails)
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Per-request connection for createJob (used before response is sent)
  const { db: reqDb, sql: reqSql } = createDbClient();
  try {
    await createJob(reqDb, jobId);
  } finally {
    await reqSql.end({ timeout: 5 }).catch(() => {});
  }

  // Separate connection for the background job — its lifetime extends past
  // the HTTP response, so we close it inside runJob's finally block.
  const { db: jobDb, sql: jobSql } = createDbClient();
  const jobPromise = runJob(jobDb, jobSql, jobId, payload);

  // On Cloudflare Workers, waitUntil keeps the isolate alive until the job finishes.
  const waitUntil = await getWaitUntil();
  if (waitUntil) {
    waitUntil(jobPromise);
  }
  // On Node.js dev server: fire-and-forget (process stays alive anyway)

  return NextResponse.json({ jobId });
}
