import { NextRequest, NextResponse } from "next/server";
import { buildComicPrompt } from "@/lib/cheermark/prompt-styles";

export const maxDuration = 60;

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
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`upstream ${res.status}: ${txt.slice(0, 300)}`);
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
      signal: AbortSignal.timeout(10_000),
    });
    if (ossRes.ok) {
      const d = await ossRes.json();
      if (d?.data) return d.data;
    }
  } catch { /* best-effort fallback to raw url */ }
  return rawUrl;
}

/**
 * Synchronous image generation — runs entirely within the request lifetime.
 * CF Workers holds open requests with pending I/O indefinitely (no 30s cap),
 * so this is reliable where waitUntil background tasks are not.
 * Retries once on failure to handle transient upstream errors.
 */
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = buildPrompt(payload);
  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawUrl = await callImageApi(prompt);
      const imageUrl = await persistToOss(rawUrl);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  return NextResponse.json(
    { error: "Image generation failed", detail: lastError },
    { status: 500 },
  );
}
