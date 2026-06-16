"use client";

import { useState } from "react";
import type { GlowGenerationPayload } from "@/lib/cheermark/glow-config";
import { effects } from "@/data/effects";
import { getPageStyle } from "@/data/page-styles";
import { LandmarkImage } from "@/components/cheermark/LandmarkImage";
import type { PageStyle } from "@/types/cheermark";

type GenState = "idle" | "loading" | "done" | "error";

interface ConfigReadySheetProps {
  open: boolean;
  onClose: () => void;
  payload: GlowGenerationPayload;
  pageStyle: PageStyle;
  onToast: (msg: string) => void;
}

export function ConfigReadySheet({
  open,
  onClose,
  payload,
  pageStyle,
  onToast,
}: ConfigReadySheetProps) {
  const [genState, setGenState] = useState<GenState>("idle");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  if (!open) return null;

  const matchLine = `${payload.homeCountry.code} ${payload.homeScore} — ${payload.awayScore} ${payload.awayCountry.code}`;
  const effectNames = payload.effects
    .map((id) => effects.find((e) => e.id === id)?.name ?? id)
    .join(" + ");
  const accentColor =
    payload.mode === "celebrate" ? "var(--cm-green)" : "var(--cm-purple-bright)";
  const styleLabel = getPageStyle(pageStyle).name;
  const isRoast = payload.mode === "roast";

  async function handleGenerate() {
    setGenState("loading");
    setGeneratedUrl(null);
    setGenError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenError(data.error ?? "Generation failed");
        setGenState("error");
      } else {
        setGeneratedUrl(data.imageUrl);
        setGenState("done");
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Network error");
      setGenState("error");
    }
  }

  function handleClose() {
    setGenState("idle");
    setGeneratedUrl(null);
    setGenError(null);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg cm-animate-pop-in">
        <div className="cm-panel rounded-b-none rounded-t-3xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 max-h-[92dvh] overflow-y-auto">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--cm-border-soft)]" />

          {/* Header */}
          <h3 className="mb-1 text-center text-sm font-black tracking-widest text-[var(--cm-text)]">
            {genState === "done" ? "YOUR CHEER·MARK ✦" : "CONFIRM CONFIG"}
          </h3>

          {/* Config summary card */}
          {genState !== "done" && (
            <div className="mb-4 overflow-hidden rounded-xl border border-[var(--cm-border-soft)]">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <LandmarkImage landmark={payload.landmark} pageStyle={pageStyle} alt={payload.landmark.name} />
              </div>
              <div className="space-y-1 px-3 py-2.5">
                <div className="text-sm font-black text-[var(--cm-text)]">{matchLine}</div>
                <div className="text-xs text-[var(--cm-text-muted)]">
                  {payload.landmark.name} · {payload.landmark.city}
                </div>
                <p className="text-xs font-bold leading-snug" style={{ color: accentColor }}>
                  &ldquo;{payload.slogan}&rdquo;
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--cm-text-muted)]">
                  {payload.mode === "celebrate" ? "Celebrate" : "Roast"} · {styleLabel} · {effectNames}
                </div>
              </div>
            </div>
          )}

          {/* Generated image result */}
          {genState === "done" && generatedUrl && (
            <div className="mb-4">
              <div className="overflow-hidden rounded-xl border-2 mb-3" style={{ borderColor: accentColor }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={generatedUrl} alt="Generated CheerMark" className="w-full" />
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-sm font-black text-[var(--cm-text)]">{matchLine}</div>
                <p className="text-xs font-bold" style={{ color: accentColor }}>
                  &ldquo;{payload.slogan}&rdquo;
                </p>
                <div className="text-[10px] text-[var(--cm-text-muted)]">
                  {payload.landmark.name} · {effectNames}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {genState === "loading" && (
            <div className="mb-4 flex flex-col items-center gap-3 py-6">
              <div
                className="size-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: accentColor, borderTopColor: "transparent" }}
              />
              <p className="text-xs font-bold text-[var(--cm-text-muted)]">
                AI is lighting up {payload.landmark.name}…
              </p>
              <p className="text-[10px] text-[var(--cm-text-muted)] opacity-60">
                This usually takes 10–20 seconds
              </p>
            </div>
          )}

          {/* Error state */}
          {genState === "error" && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
              <p className="text-xs font-bold text-red-400">Generation failed</p>
              <p className="mt-1 text-[10px] text-red-300/70">{genError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {/* Main generate button — show when idle or error */}
            {(genState === "idle" || genState === "error") && (
              <button
                type="button"
                onClick={handleGenerate}
                className={`cm-btn-generate w-full rounded-2xl py-3.5 text-base font-black tracking-[0.12em] ${isRoast ? "cm-btn-generate-roast" : ""}`}
              >
                {genState === "error" ? "RETRY GENERATION" : "✦ GENERATE IMAGE"}
              </button>
            )}

            {/* Save / share when done */}
            {genState === "done" && generatedUrl && (
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={generatedUrl}
                  download="cheermark.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`cm-btn-generate flex items-center justify-center rounded-2xl py-3 text-xs font-black tracking-widest ${isRoast ? "cm-btn-generate-roast" : ""}`}
                >
                  SAVE IMAGE
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrl).then(
                      () => onToast("Image URL copied"),
                      () => onToast("Copy failed"),
                    );
                  }}
                  className="cm-card py-3 text-xs font-black tracking-widest text-[var(--cm-text)]"
                >
                  COPY URL
                </button>
              </div>
            )}

            {/* Re-generate when done */}
            {genState === "done" && (
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-2xl border border-[var(--cm-border-soft)] py-2.5 text-[10px] font-black tracking-widest text-[var(--cm-text-muted)]"
              >
                REGENERATE
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              disabled={genState === "loading"}
              className="w-full rounded-2xl border border-[var(--cm-border-soft)] py-2.5 text-[10px] font-black tracking-widest text-[var(--cm-text-muted)] disabled:opacity-40"
            >
              BACK TO EDIT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
