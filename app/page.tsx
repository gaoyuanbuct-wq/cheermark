"use client";

import { useEffect, useState } from "react";
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
  if (c) return `linear-gradient(180deg, ${a} 0%, ${a} 33%, ${b} 33%, ${b} 66%, ${c} 66%, ${c} 100%)`;
  return `linear-gradient(180deg, ${a} 0%, ${a} 50%, ${b} 50%, ${b} 100%)`;
}

export default function Home() {
  const {
    mode, setMode,
    pageStyle, setPageStyle,
    homeCountryId, setHomeCountryId,
    awayCountryId, setAwayCountryId,
    homeScore, setHomeScore,
    awayScore, setAwayScore,
    landmarkId, setLandmarkId,
    selectedEffects, toggleEffect,
    shuffleSlogan,
    glowConfig, payload, autoSlogan,
    sortedLandmarks, recommendedCountryId,
  } = useCheermarkConfig();

  usePageStyleTheme(pageStyle);

  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [showLandmarkPicker, setShowLandmarkPicker] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHeroBanner, setShowHeroBanner] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("cm_hero_seen");
    if (!seen) setShowHeroBanner(true);
  }, []);

  function dismissHeroBanner() {
    localStorage.setItem("cm_hero_seen", "1");
    setShowHeroBanner(false);
  }

  const isComic = pageStyle === "comic";
  const isRoast = mode === "roast";

  const accentSelected = isRoast
    ? (isComic ? "cm-card-selected-roast" : "cm-card-selected-purple")
    : (isComic ? "cm-card-selected-celebrate" : "cm-card-selected-green");

  const accentColor = isRoast
    ? (isComic ? "var(--cm-roast-accent)" : "var(--cm-purple-bright)")
    : (isComic ? "var(--cm-celebrate-accent)" : "var(--cm-green)");

  const homeCountry = getCountry(homeCountryId)!;
  const awayCountry = getCountry(awayCountryId)!;
  const selectedLandmark = payload.landmark;
  const recLandmark = sortedLandmarks[0]; // first is always recommended

  function handleGenerate() {
    const qs = glowConfigToSearchParams(glowConfig);
    router.push(`/generating?${qs}`);
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }
  void showToast; // used later

  // ── Sub-components ──────────────────────────────────────────────────────────

interface ScoreSectionProps {
  isComic: boolean;
  homeCountryId: string; awayCountryId: string;
  homeScore: number; awayScore: number;
  setHomeCountryId: (v: string) => void; setAwayCountryId: (v: string) => void;
  setHomeScore: (v: number) => void; setAwayScore: (v: number) => void;
  renderTeamChip: (id: string, onChange: (v: string) => void, other: string) => React.ReactNode;
  renderScoreBox: (v: number, onChange: (v: number) => void) => React.ReactNode;
}

function ScoreSection({ isComic, homeCountryId, awayCountryId, homeScore, awayScore,
  setHomeCountryId, setAwayCountryId, setHomeScore, setAwayScore,
  renderTeamChip, renderScoreBox }: ScoreSectionProps) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <ScoreboardIcon className="size-4 text-[var(--cm-text-muted)]" />
        <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
          1. ENTER SCORE
        </h2>
      </div>
      <p className={`mb-2.5 text-[11px] text-[var(--cm-text-muted)] ${isComic ? "cm-comic-label" : ""}`}>
        👇 Tap the flags to pick <b>YOUR teams</b>, then set the real match score
      </p>
      <div className="flex items-start gap-2">
        <div className="cm-flag-pulse flex-1">{renderTeamChip(homeCountryId, setHomeCountryId, awayCountryId)}</div>
        {renderScoreBox(homeScore, setHomeScore)}
        <span className="self-center pb-6 text-xl font-black text-[var(--cm-text-muted)]">–</span>
        {renderScoreBox(awayScore, setAwayScore)}
        <div className="cm-flag-pulse flex-1">{renderTeamChip(awayCountryId, setAwayCountryId, homeCountryId)}</div>
      </div>
    </section>
  );
}

// ── Score box ───────────────────────────────────────────────────────────────
  function renderScoreBox(value: number, onChange: (v: number) => void) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="cm-led-digit grid h-14 w-12 place-items-center rounded-xl border-2 border-[rgba(251,191,36,0.45)] bg-black/50 text-3xl">
          {value}
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
            className="grid size-7 place-items-center rounded-md border border-[var(--cm-border-soft)] text-sm text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)]"
            aria-label="decrease">−</button>
          <button type="button" onClick={() => onChange(Math.min(9, value + 1))}
            className="grid size-7 place-items-center rounded-md border border-[var(--cm-border-soft)] text-sm text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)]"
            aria-label="increase">+</button>
        </div>
      </div>
    );
  }

  // ── Team chip ────────────────────────────────────────────────────────────────
  function renderTeamChip(countryId: string, onChange: (id: string) => void, otherId: string) {
    const country = getCountry(countryId)!;
    return (
      <label className="relative block flex-1 cursor-pointer">
        <span
          className="relative block overflow-hidden rounded-xl border border-[var(--cm-border-soft)] px-1 py-3 text-center text-[11px] font-black tracking-wider text-white shadow-[inset_0_0_0_200px_rgba(0,0,0,0.35)]"
          style={{ background: flagGradient(country.colors) }}
        >
          <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{country.code}</span>
        </span>
        <select className="absolute inset-0 cursor-pointer opacity-0" value={countryId}
          onChange={(e) => onChange(e.target.value)} aria-label="Select team">
          {countries.map((c) => (
            <option key={c.id} value={c.id} disabled={c.id === otherId}>{c.name}</option>
          ))}
        </select>
      </label>
    );
  }

  // ── Landmark hint text ───────────────────────────────────────────────────────
  const recCountry = getCountry(selectedLandmark.countryId);
  const landmarkHint = isRoast
    ? `🔥 Roasting ${selectedLandmark.name} · ${recCountry?.name ?? ""} — enemy territory`
    : `✦ Lighting up ${selectedLandmark.name} · ${recCountry?.name ?? ""} — your home turf`;

  return (
    <div className="cm-page">
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col">
        <TopBar
          mode={mode} pageStyle={pageStyle}
          onModeChange={setMode} onPageStyleChange={setPageStyle}
          onHelp={() => setShowHelp(true)}
        />

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        {showHeroBanner && (
          <div className={`cm-animate-slide-down mx-4 mt-2 overflow-hidden rounded-2xl border-2 ${isRoast ? "border-[var(--cm-purple)]" : "border-[var(--cm-green)]"}`}
            style={{
              background: isRoast
                ? "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(168,85,247,0.06))"
                : isComic
                  ? "linear-gradient(135deg, #ff9800 0%, #ff4081 100%)"
                  : "linear-gradient(135deg, rgba(0,230,118,0.18), rgba(0,230,118,0.06))",
            }}>
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className="mt-0.5 text-2xl shrink-0">🏆</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black leading-snug ${isComic ? "cm-style-heading text-white" : "text-[var(--cm-text)]"}`}>
                  Enter YOUR match score
                </p>
                <p className={`mt-1 text-[11px] leading-relaxed ${isComic ? "text-white/90" : "text-[var(--cm-text-muted)]"}`}>
                  Tap the flags to pick your teams, add the real scoreline → AI lights up a world landmark with it in ~45s
                </p>
              </div>
              <button type="button" onClick={dismissHeroBanner}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black tracking-wider ${isComic ? "bg-white/20 text-white" : "bg-[var(--cm-bg-card)] text-[var(--cm-text-muted)]"}`}>
                Got it →
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 space-y-5 px-4 pt-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">

          {/* ── 1. SCORE ─────────────────────────────────────────────────── */}
          <ScoreSection
            isComic={isComic}
            homeCountryId={homeCountryId} awayCountryId={awayCountryId}
            homeScore={homeScore} awayScore={awayScore}
            setHomeCountryId={setHomeCountryId} setAwayCountryId={setAwayCountryId}
            setHomeScore={setHomeScore} setAwayScore={setAwayScore}
            renderTeamChip={renderTeamChip} renderScoreBox={renderScoreBox}
          />

          {/* ── AUTO LANDMARK CARD ───────────────────────────────────────── */}
          <LandmarkCard
            isComic={isComic} isRoast={isRoast}
            accentColor={accentColor} accentSelected={accentSelected}
            selectedLandmark={selectedLandmark} landmarkHint={landmarkHint}
            pageStyle={pageStyle} showPicker={showLandmarkPicker}
            onTogglePicker={() => setShowLandmarkPicker((v) => !v)}
            sortedLandmarks={sortedLandmarks} landmarkId={landmarkId}
            recommendedCountryId={recommendedCountryId}
            recLandmark={recLandmark}
            onSelectLandmark={(id) => { setLandmarkId(id); setShowLandmarkPicker(false); }}
          />

          {/* ── SLOGAN ───────────────────────────────────────────────────── */}
          <SloganSection
            isComic={isComic} isRoast={isRoast}
            accentColor={accentColor} accentSelected={accentSelected}
            autoSlogan={autoSlogan} onShuffle={shuffleSlogan}
          />

          {/* ── EFFECTS ──────────────────────────────────────────────────── */}
          <EffectsSection
            isComic={isComic} accentColor={accentColor} accentSelected={accentSelected}
            selectedEffects={selectedEffects} toggleEffect={toggleEffect}
          />
        </main>

        {/* ── BOTTOM GENERATE BAR ──────────────────────────────────────── */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t border-[var(--cm-border-soft)] bg-[var(--cm-bg)]/95 backdrop-blur-md">
          <p className="pt-2 text-center text-[10px] text-[var(--cm-text-muted)]">
            ✨ Your score · Your teams · A one-of-a-kind AI image in ~45s
          </p>
          <div className="px-4 pt-1.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button type="button" onClick={handleGenerate}
              className={`cm-btn-generate w-full rounded-2xl py-3.5 font-black tracking-[0.12em] ${isRoast ? "cm-btn-generate-roast" : ""}`}
            >
              <span className="block text-base">✦ GENERATE</span>
              <span className="block text-[10px] font-bold opacity-80 tracking-widest mt-0.5">
                {selectedLandmark.name} · {homeCountry.code} {homeScore}–{awayScore} {awayCountry.code}
              </span>
            </button>
          </div>
        </div>

        {/* ── HELP ─────────────────────────────────────────────────────── */}
        {showHelp && (
          <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 sm:place-items-center"
            onClick={() => setShowHelp(false)}>
            <div className="cm-panel cm-animate-pop-in w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-base font-black text-[var(--cm-text)]">
                How Cheer<span className="text-[var(--cm-green)]">Mark</span> works
              </h3>
              <ul className="mb-3 space-y-2 text-xs text-[var(--cm-text-muted)]">
                <li>🎉 <b className="text-[var(--cm-text)]">Celebrate or Roast</b> — pick your vibe at the top.</li>
                <li>🌃 <b className="text-[var(--cm-text)]">Comic / Night</b> — switch the art style with LOOK.</li>
                <li>⚽ <b className="text-[var(--cm-text)]">Teams &amp; score</b> — we auto-pick the landmark for you.</li>
                <li>✦ Hit <b className="text-[var(--cm-text)]">Generate</b> — AI lights it up!</li>
              </ul>
              <button type="button" onClick={() => setShowHelp(false)}
                className="cm-btn-generate w-full rounded-xl py-2.5 text-xs font-black tracking-widest">
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

// ── LandmarkCard ─────────────────────────────────────────────────────────────

import type { Landmark, PageStyle } from "@/types/cheermark";

interface LandmarkCardProps {
  isComic: boolean; isRoast: boolean;
  accentColor: string; accentSelected: string;
  selectedLandmark: Landmark; landmarkHint: string;
  pageStyle: PageStyle; showPicker: boolean;
  onTogglePicker: () => void;
  sortedLandmarks: Landmark[]; landmarkId: string;
  recommendedCountryId: string;
  recLandmark: Landmark;
  onSelectLandmark: (id: string) => void;
}

function LandmarkCard({ isComic, isRoast, accentColor, accentSelected, selectedLandmark,
  landmarkHint, pageStyle, showPicker, onTogglePicker,
  sortedLandmarks, landmarkId, recommendedCountryId, onSelectLandmark }: LandmarkCardProps) {
  const accentGlow = isRoast ? "rgba(168,85,247,0.3)" : "rgba(0,230,118,0.3)";
  const recCountry = getCountry(selectedLandmark.countryId);

  return (
    <section>
      {/* Recommended landmark big card */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border-2 cursor-pointer"
        style={{ borderColor: accentColor, boxShadow: `0 0 24px ${accentGlow}` }}
      >
        {/* Image */}
        <div className="aspect-[16/9] w-full overflow-hidden">
          <LandmarkImage landmark={selectedLandmark} pageStyle={pageStyle} alt={selectedLandmark.name} />
        </div>

        {/* Overlay info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3.5 pt-8 pb-3">
          {/* Hint badge */}
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black"
            style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}66`, color: accentColor }}>
            {isRoast ? "🔥 ROASTING" : "✦ LIGHTING UP"}
          </div>
          <div className={`text-sm font-black text-white ${isComic ? "cm-style-heading" : ""}`}>
            {selectedLandmark.name}
          </div>
          <div className="text-[10px] text-white/60">{selectedLandmark.city}</div>
        </div>

        {/* Hint text */}
        <div className="px-3.5 py-2.5 bg-[var(--cm-bg-panel)]">
          <p className="text-[11px] leading-relaxed text-[var(--cm-text-muted)]">
            {landmarkHint}
          </p>
          {recCountry && (
            <p className="mt-0.5 text-[10px] text-[var(--cm-text-muted)] opacity-60">
              Auto-selected based on your score & mode
            </p>
          )}
        </div>

        {/* Change button */}
        <button
          type="button"
          onClick={onTogglePicker}
          className="absolute right-2.5 bottom-[2.8rem] flex items-center gap-1 rounded-full border border-[var(--cm-border-soft)] bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
        >
          {showPicker ? "✕ Close" : "⟳ Change"}
        </button>
      </div>

      {/* Collapsible landmark picker */}
      {showPicker && (
        <div className="mt-2 cm-animate-pop-in">
          <p className={`mb-2 text-[10px] text-[var(--cm-text-muted)] ${isComic ? "cm-comic-label" : ""}`}>
            Tap any landmark to switch
          </p>
          <div className="grid grid-cols-3 gap-2">
            {sortedLandmarks.map((l) => {
              const sel = l.id === landmarkId;
              const rec = l.countryId === recommendedCountryId;
              const country = getCountry(l.countryId);
              return (
                <button key={l.id} type="button" onClick={() => onSelectLandmark(l.id)}
                  className={`cm-card relative p-1 text-left ${sel ? accentSelected : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <LandmarkImage landmark={l} pageStyle={pageStyle} alt={l.name} />
                    {sel && (
                      <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full text-black"
                        style={{ background: accentColor }}>
                        <CheckIcon className="size-2.5" />
                      </span>
                    )}
                    {rec && !sel && <span className="absolute left-0.5 top-0.5 size-2 rounded-full bg-[var(--cm-amber)]" />}
                    {country && (
                      <span className="absolute bottom-0.5 left-0.5 rounded px-1 py-px text-[8px] font-black tracking-wide text-white shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                        style={{ background: flagGradient(country.colors), textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>
                        {country.code}
                      </span>
                    )}
                  </div>
                  <div className={`mt-1 truncate text-[10px] font-bold leading-tight text-[var(--cm-text)] ${isComic ? "cm-comic-label text-[11px]" : ""}`}>
                    {l.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ── SloganSection ─────────────────────────────────────────────────────────────

function SloganSection({ isComic, isRoast, accentColor, accentSelected, autoSlogan, onShuffle }:
  { isComic: boolean; isRoast: boolean; accentColor: string; accentSelected: string; autoSlogan: string; onShuffle: () => void }) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QuoteIcon className="size-4 shrink-0" style={{ color: accentColor }} />
          <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
            YOUR SLOGAN
          </h2>
        </div>
        <button type="button" onClick={onShuffle}
          className={`flex items-center gap-1 rounded-lg border border-[var(--cm-border-soft)] px-2 py-1 text-[10px] font-bold tracking-wide text-[var(--cm-text-muted)] active:border-[var(--cm-amber)] active:text-[var(--cm-amber)] ${isComic ? "cm-comic-label" : ""}`}
          aria-label="Shuffle slogan">
          <RefreshIcon className="size-3" />
          SHUFFLE
        </button>
      </div>
      <div className={`cm-panel relative overflow-hidden px-4 py-3.5 ${accentSelected}`} style={{ borderWidth: 1.5 }}>
        <QuoteIcon className="absolute right-3 top-2 size-8 opacity-[0.12]" style={{ color: accentColor }} />
        <p className="cm-slogan-text relative text-center text-sm font-black leading-snug tracking-wide"
          style={{
            color: accentColor,
            textShadow: isComic ? "none" : isRoast ? "0 0 20px rgba(168,85,247,0.35)" : "0 0 20px rgba(0,230,118,0.35)",
          }}>
          &ldquo;{autoSlogan}&rdquo;
        </p>
      </div>
    </section>
  );
}

// ── EffectsSection ────────────────────────────────────────────────────────────

function EffectsSection({ isComic, accentColor, accentSelected, selectedEffects, toggleEffect }:
  { isComic: boolean; accentColor: string; accentSelected: string; selectedEffects: EffectType[]; toggleEffect: (id: EffectType) => void }) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <SparkleIcon className="size-4 text-[var(--cm-text-muted)]" />
        <h2 className={`text-xs font-black tracking-wider text-[var(--cm-text)] ${isComic ? "cm-style-heading text-sm" : ""}`}>
          EFFECTS
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {effects.map((e) => {
          const Icon = EFFECT_ICONS[e.id];
          const selected = selectedEffects.includes(e.id);
          return (
            <button key={e.id} type="button" onClick={() => toggleEffect(e.id)}
              className={`cm-card relative flex flex-col gap-1 p-2.5 text-left ${selected ? accentSelected : ""}`}>
              {selected && (
                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full text-black"
                  style={{ background: accentColor }}>
                  <CheckIcon className="size-2.5" />
                </span>
              )}
              <Icon className="size-5" style={{ color: accentColor }} />
              <div className="text-[10px] font-bold leading-tight text-[var(--cm-text)]">{e.name}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
