export type Mode = "celebrate" | "roast";

export type PageStyle = "stadium" | "comic";

export type EffectType = "light-projection" | "led-string" | "fireworks";

export interface Country {
  id: string;
  name: string;
  code: string;
  colors: [string, string, string?];
  /** National mascot animal — used in image generation prompts */
  mascot: string;
}

export interface Landmark {
  id: string;
  countryId: string;
  name: string;
  city: string;
  description: string;
  imageUrl: string;
  promptHint: string;
}

export interface Slogan {
  id: string;
  text: string;
  mode: Mode;
}

export interface Effect {
  id: EffectType;
  name: string;
  description: string;
}

/** User configuration — passed to HappySeeds for image generation. */
export interface GlowConfig {
  mode: Mode;
  /** Visual theme for config UI and AI render style hint. */
  pageStyle: PageStyle;
  landmarkId: string;
  homeCountryId: string;
  awayCountryId: string;
  homeScore: number;
  awayScore: number;
  /** One or more effects, combined in the generated image. */
  effects: EffectType[];
  /** Shuffle index for auto slogan — keeps preview aligned with generation. */
  sloganVariant?: number;
}

/** Result from HappySeeds platform generation. */
export interface GlowGenerationResult {
  status: "pending" | "processing" | "completed" | "failed";
  jobId?: string;
  imageUrl?: string;
  error?: string;
}
