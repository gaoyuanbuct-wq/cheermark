import type { GlowConfig } from "@/types/cheermark";
import { getCountry } from "@/data/countries";
import { getLandmark } from "@/data/landmarks";
import { pickSlogan } from "@/data/slogans";

/**
 * Full payload sent to HappySeeds for CheerMark image generation.
 */
export interface GlowGenerationPayload extends GlowConfig {
  landmark: NonNullable<ReturnType<typeof getLandmark>>;
  homeCountry: NonNullable<ReturnType<typeof getCountry>>;
  awayCountry: NonNullable<ReturnType<typeof getCountry>>;
  winnerCountryId: string;
  loserCountryId: string;
  slogan: string;
  winnerMascot: string;
}

export function buildGlowPayload(config: GlowConfig): GlowGenerationPayload {
  const landmark = getLandmark(config.landmarkId);
  const homeCountry = getCountry(config.homeCountryId);
  const awayCountry = getCountry(config.awayCountryId);

  if (!landmark || !homeCountry || !awayCountry) {
    throw new Error("Invalid CheerMark configuration");
  }

  const winnerCountryId =
    config.homeScore >= config.awayScore
      ? config.homeCountryId
      : config.awayCountryId;
  const loserCountryId =
    winnerCountryId === config.homeCountryId
      ? config.awayCountryId
      : config.homeCountryId;

  const winnerCountry = winnerCountryId === config.homeCountryId ? homeCountry : awayCountry;

  return {
    ...config,
    landmark,
    homeCountry,
    awayCountry,
    winnerCountryId,
    loserCountryId,
    winnerMascot: winnerCountry.mascot,
    slogan: pickSlogan({
      mode: config.mode,
      homeCountryId: config.homeCountryId,
      awayCountryId: config.awayCountryId,
      homeScore: config.homeScore,
      awayScore: config.awayScore,
      landmarkId: config.landmarkId,
      effect: config.effects.join("-"),
      variant: config.sloganVariant ?? 0,
    }),
  };
}
