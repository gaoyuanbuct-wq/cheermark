import type { EffectType, GlowConfig, Mode, PageStyle } from "@/types/cheermark";

const MODES: Mode[] = ["celebrate", "roast"];
const PAGE_STYLES: PageStyle[] = ["stadium", "comic"];
const EFFECTS: EffectType[] = ["light-projection", "led-string", "fireworks"];

export function glowConfigToSearchParams(config: GlowConfig): string {
  const p = new URLSearchParams({
    mode: config.mode,
    pageStyle: config.pageStyle,
    landmarkId: config.landmarkId,
    homeCountryId: config.homeCountryId,
    awayCountryId: config.awayCountryId,
    homeScore: String(config.homeScore),
    awayScore: String(config.awayScore),
    effects: config.effects.join(","),
  });
  if (config.sloganVariant && config.sloganVariant > 0) {
    p.set("sloganVariant", String(config.sloganVariant));
  }
  return p.toString();
}

export function searchParamsToGlowConfig(
  params: URLSearchParams,
): GlowConfig | null {
  const mode = params.get("mode");
  const pageStyleRaw = params.get("pageStyle") ?? "stadium";
  const homeScore = Number(params.get("homeScore"));
  const awayScore = Number(params.get("awayScore"));

  if (!mode || !MODES.includes(mode as Mode)) return null;
  const pageStyle = PAGE_STYLES.includes(pageStyleRaw as PageStyle)
    ? (pageStyleRaw as PageStyle)
    : "stadium";

  const rawEffects = params.get("effects") ?? params.get("effect") ?? "";
  const effects = rawEffects
    .split(",")
    .map((e) => e.trim())
    .filter((e): e is EffectType => EFFECTS.includes(e as EffectType));
  if (effects.length === 0) return null;
  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 9 ||
    awayScore > 9
  ) {
    return null;
  }

  const landmarkId = params.get("landmarkId");
  const homeCountryId = params.get("homeCountryId");
  const awayCountryId = params.get("awayCountryId");
  if (!landmarkId || !homeCountryId || !awayCountryId) return null;

  const sloganVariantRaw = params.get("sloganVariant");
  const sloganVariant = sloganVariantRaw ? Number(sloganVariantRaw) : 0;

  return {
    mode: mode as Mode,
    pageStyle,
    landmarkId,
    homeCountryId,
    awayCountryId,
    homeScore,
    awayScore,
    effects,
    sloganVariant:
      Number.isInteger(sloganVariant) && sloganVariant >= 0 && sloganVariant <= 99
        ? sloganVariant
        : 0,
  };
}
