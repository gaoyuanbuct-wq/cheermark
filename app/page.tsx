"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EffectType } from "@/types/cheermark";
import { countries, getCountry } from "@/data/countries";
import { effects } from "@/data/effects";
import { useCheermarkConfig } from "@/hooks/use-cheermark-config";
import { usePageStyleTheme } from "@/hooks/use-page-style-theme";
import { glowConfigToSearchParams } from "@/lib/cheermark/glow-url";
import { TopBar } from "@/components/cheermark/TopBar";
import { LandmarkImage } from "@/components/cheermark/LandmarkImage";
import {
  CheckIcon,
  FireworksIcon,
  GlobeIcon,
  ProjectorIcon,
  QuoteIcon,
  RefreshIcon,
  ScoreboardIcon,
  SparkleIcon,
  StringLightsIcon,
} from "@/components/cheermark/icons";

const EFFECT_ICONS: Record<EffectType, typeof ProjectorIcon> = {
  "light-projection": ProjectorIcon,
  "led-string": StringLightsIcon,
  fireworks: FireworksIcon,
};

function flagGradient(colors: [string, string, string?]): string {
  const [a, b, c] = colors;
  if (c) {
    return `linear-gradient(180deg, ${a} 0%, ${a} 33%, ${b} 33%, ${b} 66%, ${c} 66%, ${c} 100%)`;
  }
  return `linear-gradient(180deg, ${a} 0%, ${a} 50%, ${b} 50%, ${b} 100%)`;
}

export default function Home() {
  const {
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
    shuffleSlogan,
    glowConfig,
    payload,
    autoSlogan,
    sortedLandmarks,
    recommendedCountryId,
  } = useCheermarkConfig();

  usePageStyleTheme(pageStyle);

  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleGenerate() {
    const qs = glowConfigToSearchParams(glowConfig);
    router.push(`/generating?${qs}`);
  }

  const isComic = pageStyle === "comic";
  const accentSelected =
    mode === "celebrate"
      ? isComic
        ? "cm-card-selected-celebrate"
        : "cm-card-selected-green"
      : isComic
        ? "cm-card-selected-roast"
        : "cm-card-selected-purple";
  const accentColor =
    mode === "celebrate"
      ? isComic
        ? "var(--cm-celebrate-accent)"
        : "var(--cm-green)"
      : isComic
        ? "var(--cm-roast-accent)"
        : "var(--cm-purple-bright)";

  const homeCountry = getCountry(homeCountryId)!;
  const awayCountry = getCountry(awayCountryId)!;
  const selectedLandmark = payload.landmark;
  const summaryLine = `${homeCountry.code} ${homeScore}–${awayScore} ${awayCountry.code} · ${selectedLandmark.name}`;

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function renderScoreBox(value: number, onChange: (v: number) => void) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="cm-led-digit grid h-14 w-12 place-items-center rounded-xl border-2 border-[rgba(251,191,36,0.45)] bg-black/50 text-3xl">
          {value}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="grid size-7 place-items-center rounded-md border border-[var(--cm-border-soft)] text-sm text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)]"
            aria-label="decrease"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(9, value + 1))}
            className="grid size-7 place-items-center rounded-md border border-[var(--cm-border-soft)] text-sm text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)]"
            aria-label="increase"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function renderTeamChip(
    countryId: string,
    onChange: (id: string) => void,
    otherId: string,
  ) {
    const country = getCountry(countryId)!;
    return (
      <label className="relative block flex-1 cursor-pointer">
        <span
          className="relative block overflow-hidden rounded-xl border border-[var(--cm-border-soft)] px-1 py-3 text-center text-[11px] font-black tracking-wider text-white shadow-[inset_0_0_0_200px_rgba(0,0,0,0.35)]"
          style={{ background: flagGradient(country.colors) }}
        >
          <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {country.code}
          </span>
        </span>
        <select
          className="absolute inset-0 cursor-pointer opacity-0"
          value={countryId}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select team"
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id} disabled={c.id === otherId}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="cm-page">
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
        <TopBar
          mode={mode}
          pageStyle={pageStyle}
          onModeChange={setMode}
          onPageStyleChange={setPageStyle}
          onHelp={() => setShowHelp(true)}
        />

        <main className="flex-1 space-y-5 px-4 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <section>
            <div className="mb-1 flex items-center gap-2">
              <GlobeIcon className="size-4 text-[var(--cm-text-muted)]" />
              <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
                1. CHOOSE LANDMARK
              </h2>
            </div>
            <p className={`mb-2.5 text-[11px] text-[var(--cm-text-muted)] ${isComic ? "cm-comic-label" : ""}`}>
              {mode === "celebrate"
                ? "Cheer a landmark with your score"
                : "Roast a rival landmark with your score"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {sortedLandmarks.map((l) => {
                const selected = l.id === landmarkId;
                const recommended = l.countryId === recommendedCountryId;
                const country = getCountry(l.countryId);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLandmarkId(l.id)}
                    className={`cm-card relative p-1 text-left ${selected ? accentSelected : ""}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <LandmarkImage
                        landmark={l}
                        pageStyle={pageStyle}
                        alt={l.name}
                      />
                      {selected && (
                        <span
                          className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full text-black"
                          style={{ background: accentColor }}
                        >
                          <CheckIcon className="size-2.5" />
                        </span>
                      )}
                      {recommended && !selected && (
                        <span className="absolute left-0.5 top-0.5 size-2 rounded-full bg-[var(--cm-amber)]" />
                      )}
                      {country && (
                        <span
                          className="absolute bottom-0.5 left-0.5 rounded px-1 py-px text-[8px] font-black tracking-wide text-white shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                          style={{
                            background: flagGradient(country.colors),
                            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
                          }}
                        >
                          {country.code}
                        </span>
                      )}
                    </div>
                    <div className={`mt-1 truncate text-[10px] font-bold leading-tight text-[var(--cm-text)] ${isComic ? "cm-comic-label text-[11px]" : ""}`}>
                      {l.name}
                    </div>
                    {country && (
                      <div
                        className="truncate text-[9px] leading-tight"
                        style={{
                          color: selected ? accentColor : "var(--cm-text-muted)",
                        }}
                      >
                        {country.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-1 flex items-center gap-2">
              <ScoreboardIcon className="size-4 text-[var(--cm-text-muted)]" />
              <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
                2. ENTER SCORE
              </h2>
            </div>
            <div className="flex items-start gap-2">
              {renderTeamChip(homeCountryId, setHomeCountryId, awayCountryId)}
              {renderScoreBox(homeScore, setHomeScore)}
              <span className="self-center pb-6 text-xl font-black text-[var(--cm-text-muted)]">
                –
              </span>
              {renderScoreBox(awayScore, setAwayScore)}
              {renderTeamChip(awayCountryId, setAwayCountryId, homeCountryId)}
            </div>
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <QuoteIcon
                  className="size-4 shrink-0"
                  style={{ color: accentColor }}
                />
                <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
                  3. MATCH SLOGAN
                </h2>
              </div>
              <button
                type="button"
                onClick={shuffleSlogan}
                className={`flex items-center gap-1 rounded-lg border border-[var(--cm-border-soft)] px-2 py-1 text-[10px] font-bold tracking-wide text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)] ${isComic ? "cm-comic-label" : ""}`}
                aria-label="Shuffle slogan"
              >
                <RefreshIcon className="size-3" />
                SHUFFLE
              </button>
            </div>
            <p className={`mb-2.5 text-[11px] text-[var(--cm-text-muted)] ${isComic ? "cm-comic-label" : ""}`}>
              {mode === "celebrate"
                ? "Auto-generated — celebrates your home side by scoreline"
                : "Auto-generated — sports banter aimed at the losing side"}
            </p>
            <div
              className={`cm-panel relative overflow-hidden px-4 py-3.5 ${accentSelected}`}
              style={{ borderWidth: 1.5 }}
            >
              <QuoteIcon
                className="absolute right-3 top-2 size-8 opacity-[0.12]"
                style={{ color: accentColor }}
              />
              <p
                className={`cm-slogan-text relative text-center text-sm font-black leading-snug tracking-wide`}
                style={{
                  color: accentColor,
                  textShadow: isComic
                    ? "none"
                    : mode === "celebrate"
                      ? "0 0 20px rgba(0, 230, 118, 0.35)"
                      : "0 0 20px rgba(168, 85, 247, 0.35)",
                }}
              >
                &ldquo;{autoSlogan}&rdquo;
              </p>
            </div>
          </section>

          <section>
            <div className="mb-1 flex items-center gap-2">
              <SparkleIcon className="size-4 text-[var(--cm-text-muted)]" />
              <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
                4. CHOOSE EFFECTS
              </h2>
            </div>
            <p className={`mb-2.5 text-[11px] text-[var(--cm-text-muted)] ${isComic ? "cm-comic-label" : ""}`}>
              Pick one or more — HappySeeds blends them on the landmark
            </p>
            <div className="grid grid-cols-3 gap-2">
              {effects.map((e) => {
                const Icon = EFFECT_ICONS[e.id];
                const selected = selectedEffects.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEffect(e.id)}
                    className={`cm-card relative flex flex-col gap-1 p-2.5 text-left ${selected ? accentSelected : ""}`}
                  >
                    {selected && (
                      <span
                        className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full text-black"
                        style={{ background: accentColor }}
                      >
                        <CheckIcon className="size-2.5" />
                      </span>
                    )}
                    <Icon className="size-5" style={{ color: accentColor }} />
                    <div className="text-[10px] font-bold leading-tight text-[var(--cm-text)]">
                      {e.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t border-[var(--cm-border-soft)] bg-[var(--cm-bg)]/95 backdrop-blur-md">
          <p className="truncate px-4 pt-2 text-center text-[10px] font-bold text-[var(--cm-text-muted)]">
            {summaryLine}
          </p>
          <div className="px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleGenerate}
              className={`cm-btn-generate w-full rounded-2xl py-3.5 text-base font-black tracking-[0.15em] ${
                mode === "roast" ? "cm-btn-generate-roast" : ""
              }`}
            >
              ✦ GENERATE IMAGE
            </button>
          </div>
        </div>

        {showHelp && (
          <div
            className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 sm:place-items-center"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="cm-panel cm-animate-pop-in w-full max-w-sm p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-base font-black text-[var(--cm-text)]">
                How Cheer<span className="text-[var(--cm-green)]">Mark</span>{" "}
                works
              </h3>
              <ol className="mb-3 list-decimal space-y-1 pl-4 text-xs text-[var(--cm-text-muted)]">
                <li>Pick a landmark, enter the score, choose effects.</li>
                <li>Tap Generate Image — AI lights up your landmark instantly.</li>
                <li>Save or share your CheerMark!</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="cm-btn-generate w-full rounded-xl py-2.5 text-xs font-black tracking-widest"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-[60] w-[90%] max-w-sm -translate-x-1/2 cm-animate-pop-in rounded-xl border border-[var(--cm-border)] bg-[var(--cm-bg)] px-4 py-2.5 text-center text-xs font-bold text-[var(--cm-text)]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
