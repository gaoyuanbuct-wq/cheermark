"use client";

import { useEffect, useMemo, useState } from "react";
import type { EffectType, GlowConfig, Mode, PageStyle } from "@/types/cheermark";
import { landmarks } from "@/data/landmarks";
import { generateSlogan } from "@/data/slogans";
import { buildGlowPayload } from "@/lib/cheermark/glow-config";

export function useCheermarkConfig() {
  const [mode, setMode] = useState<Mode>("celebrate");
  const [pageStyle, setPageStyle] = useState<PageStyle>("comic");
  const [homeCountryId, setHomeCountryId] = useState("brazil");
  const [awayCountryId, setAwayCountryId] = useState("germany");
  const [homeScore, setHomeScore] = useState(4);
  const [awayScore, setAwayScore] = useState(1);
  const [landmarkId, setLandmarkId] = useState("sugarloaf");
  const [selectedEffects, setSelectedEffects] = useState<EffectType[]>([
    "light-projection",
  ]);
  const [sloganVariant, setSloganVariant] = useState(0);

  useEffect(() => {
    setSloganVariant(0);
  }, [mode, homeCountryId, awayCountryId, homeScore, awayScore]);

  const winnerId = homeScore >= awayScore ? homeCountryId : awayCountryId;
  const recommendedCountryId =
    mode === "celebrate"
      ? winnerId
      : winnerId === homeCountryId
        ? awayCountryId
        : homeCountryId;

  useEffect(() => {
    const rec = landmarks.find((l) => l.countryId === recommendedCountryId);
    if (rec) setLandmarkId(rec.id);
  }, [recommendedCountryId]);

  const glowConfig: GlowConfig = useMemo(
    () => ({
      mode,
      pageStyle,
      landmarkId,
      homeCountryId,
      awayCountryId,
      homeScore,
      awayScore,
      effects: selectedEffects,
      sloganVariant,
    }),
    [
      mode,
      pageStyle,
      landmarkId,
      homeCountryId,
      awayCountryId,
      homeScore,
      awayScore,
      selectedEffects,
      sloganVariant,
    ],
  );

  const payload = useMemo(() => buildGlowPayload(glowConfig), [glowConfig]);

  const autoSlogan = useMemo(
    () => generateSlogan({
      mode,
      homeCountryId,
      awayCountryId,
      homeScore,
      awayScore,
      landmarkId,
      effect: selectedEffects.join("-"),
      variant: sloganVariant,
    }),
    [
      mode,
      homeCountryId,
      awayCountryId,
      homeScore,
      awayScore,
      landmarkId,
      selectedEffects,
      sloganVariant,
    ],
  );

  const sortedLandmarks = useMemo(() => {
    return [...landmarks].sort((a, b) => {
      const ar = a.countryId === recommendedCountryId ? 0 : 1;
      const br = b.countryId === recommendedCountryId ? 0 : 1;
      return ar - br;
    });
  }, [recommendedCountryId]);

  function toggleEffect(id: EffectType) {
    setSelectedEffects((prev) => {
      if (prev.includes(id)) {
        return prev.length === 1 ? prev : prev.filter((e) => e !== id);
      }
      return [...prev, id];
    });
  }

  return {
    mode,
    setMode,
    pageStyle,
    setPageStyle,
    homeCountryId,
    setHomeCountryId,
    awayCountryId,
    setAwayCountryId,
    homeScore,
    setHomeScore,
    awayScore,
    setAwayScore,
    landmarkId,
    setLandmarkId,
    selectedEffects,
    toggleEffect,
    sloganVariant,
    shuffleSlogan: () => setSloganVariant((v) => v + 1),
    glowConfig,
    payload,
    autoSlogan,
    sortedLandmarks,
    recommendedCountryId,
  };
}
