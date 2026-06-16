import { NextRequest, NextResponse } from "next/server";
import { buildComicPrompt } from "@/lib/cheermark/prompt-styles";

// Allow up to 90s for image generation
export const maxDuration = 90;

const REACTUS_BASE_URL = process.env.REACTUS_BASE_URL ?? "";
const API_KEY = process.env.HAPPYSEEDS_KEY ?? "";
const PROJECT_ID = process.env.HAPPYSEEDS_PROJECT_ID ?? "";
const MODEL = "doubao-seedream-5-0-260128";

/** Convert hex color array to readable color names for the prompt */
function colorLabel(colors: string[]): string {
  const HEX_NAMES: Record<string, string> = {
    "#009C3B": "green", "#FFDF00": "yellow", "#002776": "deep blue",
    "#000000": "black", "#DD0000": "red", "#FFCE00": "golden yellow",
    "#002395": "blue", "#FFFFFF": "white", "#ED2939": "red",
    "#CE1124": "red", "#AA151B": "crimson red", "#F1BF00": "gold",
    "#74ACDF": "sky blue", "#009246": "green", "#CE2B37": "red",
    "#006600": "dark green", "#FF0000": "red",
    "#AE1C28": "red", "#21468B": "blue",
    "#B22234": "red", "#3C3B6E": "navy blue",
    "#006847": "dark green", "#CE1126": "red",
    "#BC002D": "crimson",
  };
  return colors.slice(0, 2).map(c => HEX_NAMES[c] ?? c).join(" and ");
}

function buildPrompt(payload: {
  mode: string;
  pageStyle?: string;
  landmark: { name: string; city: string; promptHint: string };
  homeCountry: { name: string; code: string; colors?: string[] };
  awayCountry: { name: string; code: string; colors?: string[] };
  homeScore: number;
  awayScore: number;
  effects: string[];
  slogan: string;
  winnerCountryId: string;
  homeCountryId: string;
  winnerMascot?: string;
}): string {
  const { mode, pageStyle, landmark, homeCountry, awayCountry, homeScore, awayScore, effects, slogan, winnerCountryId, homeCountryId } = payload;
  const winner = winnerCountryId === homeCountryId ? homeCountry : awayCountry;
  const scoreStr = `${homeCountry.code} ${homeScore} - ${awayScore} ${awayCountry.code}`;
  const isComic = pageStyle === "comic";

  // Winner's flag colors drive the lighting theme
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
  const effectDesc = effects.map((e) => effectDescriptions[e] ?? e).join(", ");

  const moodDesc = mode === "celebrate"
    ? `celebratory, triumphant, euphoric atmosphere for ${winner.name} fans`
    : `dramatic, taunting, roast atmosphere, mocking the losing team`;

  if (isComic) {
    const winnerMascot = payload.winnerMascot ?? "a cute animal mascot";
    return buildComicPrompt({ landmark, winnerColors, colorTheme, effectDesc, scoreStr, slogan, moodDesc, winnerMascot });
  }

  return [
    `Epic cinematic NIGHT scene, set after dark, deep black sky full of stars: ${landmark.promptHint}.`,
    `${colorTheme}`,
    `The landmark is dramatically illuminated with ${winnerColors} colored spotlights and ${effectDesc}.`,
    `The scoreline "${scoreStr}" is projected in giant glowing ${winnerColors} numbers DIRECTLY ONTO`,
    `the facade and surface of the landmark itself — light-mapped onto the architecture, NOT on a sign or board on the ground.`,
    `The slogan "${slogan}" is also inscribed in glowing ${winnerColors} light across the landmark's surface.`,
    `Mood: ${moodDesc}.`,
    `Photorealistic, ultra high detail, night photography, long exposure, dramatic ${winnerColors} light trails,`,
    `architectural light projection mapping, city lights in background, 4K quality, purely nighttime.`,
  ].join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const prompt = buildPrompt(payload);

    // Call doubao image generation (60s timeout — generation takes 20-35s)
    const genRes = await fetch(`${REACTUS_BASE_URL}/v1/llm_server`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "x-bty-app": PROJECT_ID,
        "x-bty-model": MODEL,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size: "1440x2560",
        output_format: "png",
        watermark: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      return NextResponse.json({ error: `Generation failed: ${errText}` }, { status: 500 });
    }

    const genData = await genRes.json();
    const imageUrl: string | undefined = genData?.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL returned", raw: genData }, { status: 500 });
    }

    // Persist to OSS
    const ossRes = await fetch(`${REACTUS_BASE_URL}/v1/llm_server/file_dump_to_oss`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ project_id: PROJECT_ID, url: imageUrl }),
    });

    if (!ossRes.ok) {
      // OSS failed but we still have the original URL — return it
      return NextResponse.json({ imageUrl, persisted: false });
    }

    const ossData = await ossRes.json();
    const persistedUrl: string = ossData?.data ?? imageUrl;

    return NextResponse.json({ imageUrl: persistedUrl, persisted: true, prompt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
