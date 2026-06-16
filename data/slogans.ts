import type { Mode, Slogan } from "@/types/cheermark";
import { getCountry } from "@/data/countries";

/** Legacy catalog — kept for reference / future curated picks. */
export const slogans: Slogan[] = [
  { id: "cel-1", text: "Glory tonight!", mode: "celebrate" },
  { id: "cel-2", text: "Samba never stops!", mode: "celebrate" },
  { id: "cel-3", text: "The city is ours!", mode: "celebrate" },
  { id: "cel-4", text: "What a night!", mode: "celebrate" },
  { id: "cel-5", text: "Pure football magic!", mode: "celebrate" },
  { id: "cel-6", text: "We made history!", mode: "celebrate" },
  { id: "rst-1", text: "History repeats.", mode: "roast" },
  { id: "rst-2", text: "Thanks for the goals.", mode: "roast" },
  { id: "rst-3", text: "Better luck in 4 years.", mode: "roast" },
  { id: "rst-4", text: "We lit up YOUR city.", mode: "roast" },
  { id: "rst-5", text: "7 reasons to celebrate.", mode: "roast" },
  { id: "rst-6", text: "Your landmark, our score.", mode: "roast" },
];

export function getSlogansByMode(mode: Mode): Slogan[] {
  return slogans.filter((s) => s.mode === mode);
}

export function getSlogan(id: string): Slogan | undefined {
  return slogans.find((s) => s.id === id);
}

export interface GenerateSloganArgs {
  mode: Mode;
  homeCountryId: string;
  awayCountryId: string;
  homeScore: number;
  awayScore: number;
  landmarkId?: string;
  effect?: string;
  /** Shuffle index — same inputs + variant = same line (preview matches generation). */
  variant?: number;
}

type CelebrateTier =
  | "draw"
  | "narrow_win"
  | "win"
  | "big_win"
  | "narrow_loss"
  | "loss"
  | "big_loss";

type RoastTier = "narrow" | "medium" | "dominant";

const CELEBRATE_POOL: Record<CelebrateTier, string[]> = {
  draw: [
    "Point shared — {homeCode} stays in the fight.",
    "Hard-fought draw. {homeCode} marches on.",
    "One point, still moving forward, {homeCode}.",
  ],
  narrow_win: [
    "{homeCode} — one step forward.",
    "Three points in the bag for {homeCode}.",
    "Job done. {homeCode} keeps climbing.",
    "Narrow win, big heart — {homeCode}.",
  ],
  win: [
    "{homeCode} showed up tonight!",
    "Solid win — {homeCode} owns the moment.",
    "{scoreLine}. That's {homeCode} football.",
    "Cheer for {homeCode} tonight.",
  ],
  big_win: [
    "{scoreLine}! ABSOLUTE SCENES FOR {homeCode}!",
    "WHAT A NIGHT — {homeCode} ON FIRE!",
    "{homeCode} UNSTOPPABLE. {scoreLine}!",
    "The whole city erupts for {homeCode}!",
    "Pure euphoria — {homeCode} runs riot!",
  ],
  narrow_loss: [
    "Tough night, but {homeCode} bounces back.",
    "One goal short — {homeCode} stays proud.",
    "Head up, {homeCode}. Next one's ours.",
  ],
  loss: [
    "{homeCode} takes the L — we go again.",
    "Not our night, {homeCode}. Regroup and reload.",
    "Scoreline stings, {homeCode} stays united.",
  ],
  big_loss: [
    "Rough result for {homeCode} — back to work.",
    "Heavy night, {homeCode}. Chin up, season's long.",
    "{homeCode} takes it on the chin. We rebuild.",
  ],
};

/** Sports-banter roast lines — mock the result, never the person. */
const ROAST_POOL: Record<RoastTier, string[]> = {
  narrow: [
    "Close, {loserCode} — but close doesn't win trophies.",
    "Almost had it, {loserCode}. Almost.",
    "{scoreLine}. Slim margin, big bragging rights.",
    "{loserCode}, we'll take those three points.",
  ],
  medium: [
    "{scoreLine} — tough night at the office, {loserCode}.",
    "Thanks for coming, {loserCode}. Safe trip home.",
    "{loserCode}, that scoreboard isn't lying.",
    "Your landmark, our victory lap, {loserCode}.",
    "Defense optional tonight, {loserCode}?",
  ],
  dominant: [
    "{scoreLine}. Ouch, {loserCode}.",
    "Goal difference matters, {loserCode}.",
    "We lit up YOUR city — {scoreLine}.",
    "{loserCode}, better luck in four years.",
    "That's not a scoreline, {loserCode} — that's a statement.",
    "Count the goals, {loserCode}. We'll wait.",
  ],
};

function celebrateTier(homeMargin: number): CelebrateTier {
  if (homeMargin === 0) return "draw";
  if (homeMargin === 1) return "narrow_win";
  if (homeMargin >= 2 && homeMargin <= 3) return "win";
  if (homeMargin >= 4) return "big_win";
  if (homeMargin === -1) return "narrow_loss";
  if (homeMargin >= -3) return "loss";
  return "big_loss";
}

function roastTier(winMargin: number): RoastTier {
  if (winMargin <= 1) return "narrow";
  if (winMargin <= 3) return "medium";
  return "dominant";
}

function fillTemplate(
  template: string,
  ctx: {
    homeCode: string;
    awayCode: string;
    loserCode: string;
    scoreLine: string;
  },
): string {
  return template
    .replaceAll("{homeCode}", ctx.homeCode)
    .replaceAll("{awayCode}", ctx.awayCode)
    .replaceAll("{loserCode}", ctx.loserCode)
    .replaceAll("{scoreLine}", ctx.scoreLine);
}

function stableIndex(seed: number, length: number): number {
  if (length <= 0) return 0;
  return ((seed % length) + length) % length;
}

/** Score- and mode-aware slogan — deterministic for preview + generation. */
export function generateSlogan(args: GenerateSloganArgs): string {
  const home = getCountry(args.homeCountryId);
  const away = getCountry(args.awayCountryId);
  const homeCode = home?.code ?? "HOME";
  const awayCode = away?.code ?? "AWAY";
  const homeMargin = args.homeScore - args.awayScore;
  const winMargin = Math.abs(homeMargin);
  const winnerIsHome = args.homeScore >= args.awayScore;
  const loserCode = winnerIsHome ? awayCode : homeCode;
  const winnerScore = winnerIsHome ? args.homeScore : args.awayScore;
  const loserScore = winnerIsHome ? args.awayScore : args.homeScore;
  const scoreLine = `${winnerScore}–${loserScore}`;

  const ctx = { homeCode, awayCode, loserCode, scoreLine };

  const pool =
    args.mode === "celebrate"
      ? CELEBRATE_POOL[celebrateTier(homeMargin)]
      : ROAST_POOL[roastTier(winMargin)];

  const seed =
    args.homeScore * 100 +
    args.awayScore * 10 +
    (args.variant ?? 0) +
    args.homeCountryId.length +
    args.awayCountryId.length +
    (args.landmarkId?.length ?? 0) +
    (args.effect?.length ?? 0) +
    (args.mode === "roast" ? 17 : 3);

  return fillTemplate(pool[stableIndex(seed, pool.length)], ctx);
}

/** @deprecated Use generateSlogan — kept for callers expecting pickSlogan. */
export function pickSlogan(args: {
  mode: Mode;
  homeScore: number;
  awayScore: number;
  landmarkId: string;
  effect: string;
  homeCountryId?: string;
  awayCountryId?: string;
  variant?: number;
}): string {
  return generateSlogan({
    mode: args.mode,
    homeCountryId: args.homeCountryId ?? "brazil",
    awayCountryId: args.awayCountryId ?? "germany",
    homeScore: args.homeScore,
    awayScore: args.awayScore,
    landmarkId: args.landmarkId,
    effect: args.effect,
    variant: args.variant,
  });
}
