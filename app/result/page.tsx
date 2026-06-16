"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchParamsToGlowConfig } from "@/lib/cheermark/glow-url";
import { buildGlowPayload } from "@/lib/cheermark/glow-config";
import { effects as effectsList } from "@/data/effects";
import { BallIcon, RefreshIcon, DownloadIcon, ShareIcon } from "@/components/cheermark/icons";
import { usePageStyleTheme } from "@/hooks/use-page-style-theme";
import { ShareSheet } from "@/components/cheermark/ShareSheet";
import { useState } from "react";

function ResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const imageUrl = searchParams.get("imageUrl") ?? "";
  const config = searchParamsToGlowConfig(searchParams);
  const payload = config ? buildGlowPayload(config) : null;

  const isRoast = config?.mode === "roast";
  const accentColor = isRoast ? "var(--cm-purple-bright)" : "var(--cm-green)";
  const accentGlow = isRoast ? "rgba(168,85,247,0.45)" : "rgba(0,230,118,0.45)";

  usePageStyleTheme(config?.pageStyle ?? "stadium");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cheermark.png";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Saved!");
    } catch {
      // fallback: open in new tab
      window.open(imageUrl, "_blank");
      showToast("Opened in new tab — long press to save");
    } finally {
      setSaving(false);
    }
  }

  function handleShare() {
    setShowShare(true);
  }

  function handleRegenerate() {
    // strip imageUrl, keep config params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("imageUrl");
    router.push(`/generating?${params.toString()}`);
  }

  const matchLine = payload
    ? `${payload.homeCountry.code} ${payload.homeScore} – ${payload.awayScore} ${payload.awayCountry.code}`
    : "";
  const effectNames = payload?.effects
    .map((id) => effectsList.find((e) => e.id === id)?.name ?? id)
    .join(" + ") ?? "";

  if (!imageUrl) {
    return (
      <div className="cm-page grid min-h-dvh place-items-center">
        <div className="text-center">
          <p className="text-sm text-[var(--cm-text-muted)]">No image found.</p>
          <button onClick={() => router.push("/")} className="cm-btn-generate mt-4 rounded-2xl px-6 py-3 text-sm font-black">
            ← START OVER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="cm-topbar sticky top-0 z-40 border-b border-[var(--cm-border-soft)] bg-[var(--cm-bg)]/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="cm-logo-ball grid size-9 shrink-0 place-items-center rounded-full border border-[var(--cm-green)] text-[var(--cm-green)] shadow-[0_0_12px_rgba(0,230,118,0.35)]">
              <BallIcon className="size-5" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-black tracking-tight text-[var(--cm-text)]">
                Cheer<span className="text-[var(--cm-green)]">Mark</span>
              </div>
              <div className="text-[9px] text-[var(--cm-text-muted)]">Your mark is ready ✦</div>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-[var(--cm-border-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--cm-text-muted)]"
          >
            NEW MARK
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">

        {/* Generated image — full width, prominent */}
        <div
          className="w-full overflow-hidden rounded-2xl border-2"
          style={{ borderColor: accentColor, boxShadow: `0 0 48px ${accentGlow}, 0 0 96px ${accentGlow}40` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Generated CheerMark" className="w-full" />
        </div>

        {/* Info block */}
        {payload && (
          <div className="space-y-1 text-center">
            <p className="text-xl font-black tracking-widest text-[var(--cm-text)]">{matchLine}</p>
            <p className="text-base font-black italic" style={{ color: accentColor, textShadow: `0 0 20px ${accentGlow}` }}>
              &ldquo;{payload.slogan}&rdquo;
            </p>
            <p className="text-[11px] text-[var(--cm-text-muted)]">
              {payload.landmark.name} · {payload.landmark.city}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--cm-text-muted)]">
              {effectNames}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {/* Primary row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`cm-btn-generate flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black tracking-widest ${isRoast ? "cm-btn-generate-roast" : ""} disabled:opacity-60`}
            >
              <DownloadIcon className="size-4" />
              {saving ? "SAVING…" : "SAVE"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="cm-card flex items-center justify-center gap-2 py-3.5 text-sm font-black tracking-widest text-[var(--cm-text)]"
            >
              <ShareIcon className="size-4" />
              SHARE
            </button>
          </div>

          {/* Regenerate */}
          <button
            type="button"
            onClick={handleRegenerate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--cm-border-soft)] py-3 text-xs font-black tracking-widest text-[var(--cm-text-muted)]"
          >
            <RefreshIcon className="size-3.5" />
            REGENERATE
          </button>

          {/* Back to edit */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-2 text-[10px] text-[var(--cm-text-muted)]"
          >
            ← Edit config
          </button>
        </div>
      </main>

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        imageUrl={imageUrl}
        matchLine={matchLine}
        slogan={payload?.slogan ?? ""}
        landmarkName={payload?.landmark.name ?? ""}
        isRoast={isRoast}
        accentColor={accentColor}
      />

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 cm-animate-pop-in rounded-xl border border-[var(--cm-border)] bg-[var(--cm-bg)] px-5 py-2.5 text-xs font-bold text-[var(--cm-text)]">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="cm-page grid min-h-dvh place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-[var(--cm-green)] border-t-transparent" /></div>}>
      <ResultInner />
    </Suspense>
  );
}
