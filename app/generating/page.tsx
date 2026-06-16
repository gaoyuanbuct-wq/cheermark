"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshIcon } from "@/components/cheermark/icons";
import { searchParamsToGlowConfig } from "@/lib/cheermark/glow-url";
import { buildGlowPayload } from "@/lib/cheermark/glow-config";
import { BallIcon } from "@/components/cheermark/icons";
import { usePageStyleTheme } from "@/hooks/use-page-style-theme";
import { getLandmarkImageUrl } from "@/lib/cheermark/landmark-image";

const STAGES = [
  { pct: 10, label: "Reading your config…" },
  { pct: 25, label: "Building the scene prompt…" },
  { pct: 45, label: "AI is painting the landmark…" },
  { pct: 62, label: "Adding light effects…" },
  { pct: 78, label: "Finishing touches…" },
  { pct: 90, label: "Almost there — complex scenes can take up to 1 min…" },
];

function GeneratingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState(STAGES[0].label);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const calledRef = useRef(false);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // parse config from URL — stable reference
  const config = useMemo(() => searchParamsToGlowConfig(searchParams), [searchParams]);
  const payload = useMemo(() => (config ? buildGlowPayload(config) : null), [config]);
  const isRoast = config?.mode === "roast";
  const accentColor = isRoast ? "var(--cm-purple-bright)" : "var(--cm-green)";
  const accentGlow = isRoast ? "rgba(168,85,247,0.5)" : "rgba(0,230,118,0.5)";

  // extract stable query string once
  const configQs = useMemo(() => searchParams.toString(), [searchParams]);

  // restart the fake progress ticker
  const startTicker = useCallback(() => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    let idx = 0;
    setProgress(STAGES[0].pct);
    setStageLabel(STAGES[0].label);
    tickerRef.current = setInterval(() => {
      idx++;
      if (idx < STAGES.length) {
        setProgress(STAGES[idx].pct);
        setStageLabel(STAGES[idx].label);
      } else {
        clearInterval(tickerRef.current!);
      }
    }, 2200);
  }, []);

  const startRetryCountdown = useCallback((retryFn: () => void) => {
    setFailed(true);
    setProgress(0);
    setStageLabel("Hmm, taking longer than expected…");
    let cd = 5;
    setCountdown(cd);
    const cdTimer = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) {
        clearInterval(cdTimer);
        setFailed(false);
        retryFn();
      }
    }, 1000);
  }, []);

  // Synchronous generation: POST /start waits for imageUrl directly
  const runGenerate = useCallback(() => {
    if (!payload) return;
    setFailed(false);
    setCountdown(0);
    startTicker();

    // Read SSE stream — POST + manual stream reading (EventSource only supports GET)
    (async () => {
      try {
        const res = await fetch("/api/generate/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(100_000), // 100s fallback
        });

        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let result: { imageUrl?: string; error?: string; detail?: string } | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const evt of parts) {
            const line = evt.split("\n").find(l => l.startsWith("data:"));
            if (line) result = JSON.parse(line.slice(5).trim());
          }
        }

        if (!result || result.error || !result.imageUrl) {
          throw new Error(result?.error ?? "No image URL in response");
        }

        if (tickerRef.current) clearInterval(tickerRef.current);
        setProgress(100);
        setStageLabel("Done!");
        const dest = `/result?imageUrl=${encodeURIComponent(result.imageUrl)}&${configQs}`;
        setTimeout(() => router.push(dest), 400);
      } catch {
        if (tickerRef.current) clearInterval(tickerRef.current);
        startRetryCountdown(runGenerate);
      }
    })();
  }, [payload, router, configQs, startTicker, startRetryCountdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // fire once on mount
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    runGenerate();
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [runGenerate]);

  usePageStyleTheme(config?.pageStyle ?? "stadium");

  const landmark = payload?.landmark;
  const matchLine = payload
    ? `${payload.homeCountry.code} ${payload.homeScore} – ${payload.awayScore} ${payload.awayCountry.code}`
    : "";

  if (!config) {
    return (
      <div className="cm-page grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-sm font-bold text-[var(--cm-text-muted)]">Invalid config — please go back and try again.</p>
          <button onClick={() => router.push("/")} className="cm-btn-generate mt-4 rounded-2xl px-6 py-3 text-sm font-black">
            ← BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page flex min-h-dvh flex-col">
      {/* Top bar — same style as home */}
      <header className="cm-topbar sticky top-0 z-40 border-b border-[var(--cm-border-soft)] bg-[var(--cm-bg)]/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <span className="cm-logo-ball grid size-9 shrink-0 place-items-center rounded-full border border-[var(--cm-green)] text-[var(--cm-green)] shadow-[0_0_12px_rgba(0,230,118,0.35)]">
            <BallIcon className="size-5" />
          </span>
          <div className="leading-tight">
            <div className="text-lg font-black tracking-tight text-[var(--cm-text)]">
              Cheer<span className="text-[var(--cm-green)]">Mark</span>
            </div>
            <div className="text-[9px] text-[var(--cm-text-muted)]">Generating your mark…</div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-10">

        {/* Landmark name + match */}
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cm-text-muted)]">
            {landmark?.city ?? ""}
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-[var(--cm-text)]">
            {landmark?.name ?? ""}
          </h1>
          <p className="mt-1 text-base font-black tracking-widest" style={{ color: accentColor }}>
            {matchLine}
          </p>
        </div>

        {/* Pulsing landmark preview — comic or night depending on pageStyle */}
        {landmark && (
          <div
            className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border-2"
            style={{ borderColor: accentColor, boxShadow: `0 0 40px ${accentGlow}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getLandmarkImageUrl(landmark, config?.pageStyle ?? "stadium")}
              alt={landmark.name}
              className="aspect-[3/4] w-full object-cover"
              style={{ filter: "brightness(0.65) saturate(1.2)" }}
            />
            {/* scan line */}
            <div
              className="cm-animate-scan absolute inset-x-0 h-px opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />
            {/* overlay slogan */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-5">
              <p className="text-center text-xs font-black italic text-white/90">
                &ldquo;{payload?.slogan}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-sm space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--cm-border-soft)]">
            <div
              className="h-full rounded-full transition-all duration-[1800ms] ease-out"
              style={{
                width: `${progress}%`,
                background: failed
                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                  : `linear-gradient(90deg, ${accentColor}, ${accentGlow})`,
                boxShadow: failed ? "0 0 12px rgba(239,68,68,0.5)" : `0 0 12px ${accentGlow}`,
              }}
            />
          </div>
          <p className="text-center text-xs font-bold text-[var(--cm-text-muted)]">
            {stageLabel}
          </p>
        </div>

        {/* Failed state — auto-retry countdown */}
        {failed && (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-[var(--cm-border-soft)] bg-[var(--cm-bg-panel)] px-5 py-5 text-center">
            <p className="text-sm font-bold text-[var(--cm-text)]">
              The AI is a bit busy right now
            </p>
            <p className="text-xs text-[var(--cm-text-muted)]">
              Auto-retrying in <span className="font-black" style={{ color: accentColor }}>{countdown}s</span>…
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setCountdown(0); setFailed(false); runGenerate(); }}
                className={`cm-btn-generate flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black tracking-widest ${isRoast ? "cm-btn-generate-roast" : ""}`}
              >
                <RefreshIcon className="size-3.5" />
                RETRY NOW
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-2xl border border-[var(--cm-border-soft)] px-5 py-2.5 text-xs font-bold text-[var(--cm-text-muted)]"
              >
                EDIT
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={<div className="cm-page grid min-h-dvh place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-[var(--cm-green)] border-t-transparent" /></div>}>
      <GeneratingInner />
    </Suspense>
  );
}
