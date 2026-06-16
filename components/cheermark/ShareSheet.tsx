"use client";

import { useState } from "react";
import { DownloadIcon, CheckIcon } from "@/components/cheermark/icons";

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  matchLine: string;
  slogan: string;
  landmarkName: string;
  isRoast: boolean;
  accentColor: string;
}

type PlatformId = "x" | "instagram" | "facebook" | "reddit";
type Step = "idle" | "saving" | "saved" | "jumping";

interface Platform {
  id: PlatformId;
  name: string;
  emoji: string;
  color: string;
  hint: string;
  buildUrl: (caption: string) => string;
}

function buildCaption(matchLine: string, slogan: string, landmarkName: string): string {
  return `${matchLine} — "${slogan}" · ${landmarkName} · Made with CheerMark #CheerMark #Football`;
}

export function ShareSheet({
  open, onClose, imageUrl, matchLine, slogan, landmarkName, isRoast, accentColor,
}: ShareSheetProps) {
  const [step, setStep] = useState<Step>("idle");
  const [activePlatform, setActivePlatform] = useState<PlatformId | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  if (!open) return null;

  const caption = buildCaption(matchLine, slogan, landmarkName);

  const platforms: Platform[] = [
    {
      id: "x",
      name: "X (Twitter)",
      emoji: "𝕏",
      color: "#000000",
      hint: "Opens X with caption pre-filled — attach the saved image",
      buildUrl: (c) => `https://x.com/intent/tweet?text=${encodeURIComponent(c)}`,
    },
    {
      id: "instagram",
      name: "Instagram",
      emoji: "📸",
      color: "#E1306C",
      hint: "Save image first, then open Instagram to post",
      buildUrl: () => `https://www.instagram.com/`,
    },
    {
      id: "facebook",
      name: "Facebook",
      emoji: "f",
      color: "#1877F2",
      hint: "Opens Facebook share dialog with caption",
      buildUrl: (c) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(c)}`,
    },
    {
      id: "reddit",
      name: "Reddit",
      emoji: "👽",
      color: "#FF4500",
      hint: "Opens Reddit submit page with title pre-filled",
      buildUrl: (c) =>
        `https://www.reddit.com/submit?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(c)}`,
    },
  ];

  async function saveImage(): Promise<boolean> {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cheermark.png";
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      window.open(imageUrl, "_blank");
      return true;
    }
  }

  async function handlePlatform(platform: Platform) {
    setActivePlatform(platform.id);
    setStep("saving");

    await saveImage();
    setStep("saved");

    await new Promise((r) => setTimeout(r, 900));
    setStep("jumping");

    await new Promise((r) => setTimeout(r, 600));
    window.open(platform.buildUrl(caption), "_blank");
    setStep("idle");
    setActivePlatform(null);
  }

  async function handleCopyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg cm-animate-pop-in">
        <div className="cm-panel rounded-b-none rounded-t-3xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--cm-border-soft)]" />
          <ShareSheetContent
            platforms={platforms}
            step={step}
            activePlatform={activePlatform}
            caption={caption}
            copyDone={copyDone}
            accentColor={accentColor}
            isRoast={isRoast}
            onPlatform={handlePlatform}
            onCopyCaption={handleCopyCaption}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}

interface ContentProps {
  platforms: Platform[];
  step: Step;
  activePlatform: PlatformId | null;
  caption: string;
  copyDone: boolean;
  accentColor: string;
  isRoast: boolean;
  onPlatform: (p: Platform) => void;
  onCopyCaption: () => void;
  onClose: () => void;
}

function ShareSheetContent({
  platforms, step, activePlatform, caption, copyDone,
  accentColor, isRoast, onPlatform, onCopyCaption, onClose,
}: ContentProps) {
  return (
    <>
      <h3 className="mb-1 text-center text-sm font-black tracking-widest text-[var(--cm-text)]">
        SHARE YOUR MARK
      </h3>

      {/* Step indicator */}
      <StepIndicator step={step} activePlatform={activePlatform} platforms={platforms} />

      {/* Platform grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {platforms.map((p) => {
          const isActive = activePlatform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={step !== "idle"}
              onClick={() => onPlatform(p)}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--cm-border-soft)] bg-[var(--cm-bg-card)] py-3 text-center transition-all active:scale-95 disabled:opacity-50"
              style={isActive ? { borderColor: accentColor, boxShadow: `0 0 12px ${accentColor}60` } : {}}
            >
              <span className="text-xl leading-none"
                style={{ fontFamily: p.id === "x" ? "serif" : "inherit", fontWeight: p.id === "x" ? 900 : 400 }}>
                {p.emoji}
              </span>
              <span className="text-[10px] font-bold text-[var(--cm-text)]">{p.name}</span>
              {isActive && step === "saving" && (
                <span className="text-[9px] text-[var(--cm-text-muted)]">Saving…</span>
              )}
              {isActive && step === "saved" && (
                <span className="text-[9px]" style={{ color: accentColor }}>Saved ✓</span>
              )}
              {isActive && step === "jumping" && (
                <span className="text-[9px]" style={{ color: accentColor }}>Opening…</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint text based on step */}
      <HintText step={step} activePlatform={activePlatform} platforms={platforms} />

      {/* Caption preview + copy */}
      <div className="mt-4 rounded-xl border border-[var(--cm-border-soft)] bg-[var(--cm-bg-card)] px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--cm-text-muted)]">Caption ready to paste</span>
          <button
            type="button"
            onClick={onCopyCaption}
            className="flex items-center gap-1 rounded-lg border border-[var(--cm-border-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--cm-text-muted)]"
          >
            {copyDone ? <><CheckIcon className="size-2.5" style={{ color: accentColor }} /> COPIED</> : "COPY"}
          </button>
        </div>
        <p className="line-clamp-2 text-[10px] leading-relaxed text-[var(--cm-text-muted)]">{caption}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-2xl border border-[var(--cm-border-soft)] py-2.5 text-[10px] font-bold text-[var(--cm-text-muted)]"
      >
        CLOSE
      </button>
    </>
  );
}

function StepIndicator({ step, activePlatform, platforms }: {
  step: Step; activePlatform: PlatformId | null; platforms: Platform[];
}) {
  const platform = platforms.find(p => p.id === activePlatform);
  if (step === "idle") {
    return <p className="mt-1 text-center text-[11px] text-[var(--cm-text-muted)]">Choose a platform — image saves automatically, then we open the app for you</p>;
  }
  if (step === "saving") {
    return (
      <div className="mt-2 flex items-center justify-center gap-2">
        <div className="size-3.5 animate-spin rounded-full border-2 border-[var(--cm-green)] border-t-transparent" />
        <span className="text-xs font-bold text-[var(--cm-text)]">Saving image to your device…</span>
      </div>
    );
  }
  if (step === "saved") {
    return (
      <div className="mt-2 flex items-center justify-center gap-2">
        <CheckIcon className="size-4 text-[var(--cm-green)]" />
        <span className="text-xs font-bold text-[var(--cm-green)]">Image saved! Opening {platform?.name}…</span>
      </div>
    );
  }
  return (
    <p className="mt-2 text-center text-xs font-bold text-[var(--cm-text-muted)]">
      Opening {platform?.name}…
    </p>
  );
}

function HintText({ step, activePlatform, platforms }: {
  step: Step; activePlatform: PlatformId | null; platforms: Platform[];
}) {
  const platform = platforms.find(p => p.id === activePlatform);
  if (step !== "idle" || !platform) return null;
  return null;
}
