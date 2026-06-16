"use client";

import type { Mode, PageStyle } from "@/types/cheermark";
import { CheckIcon } from "@/components/cheermark/icons";

interface ModeToggleProps {
  mode: Mode;
  pageStyle: PageStyle;
  onModeChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, pageStyle, onModeChange }: ModeToggleProps) {
  if (pageStyle === "comic") {
    return (
      <div className="grid grid-cols-2 gap-2 px-4 pb-2" role="group" aria-label="Choose mode">
        <button
          type="button"
          onClick={() => onModeChange("celebrate")}
          aria-pressed={mode === "celebrate"}
          className={`cm-mode-card cm-mode-celebrate relative overflow-hidden rounded-2xl border-[3px] border-[#1a1208] p-3 text-left shadow-[4px_4px_0_#1a1208] transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1208] ${
            mode === "celebrate" ? "ring-2 ring-[#1a1208] ring-offset-2 ring-offset-[#fff5d6]" : "opacity-90"
          }`}
        >
          {mode === "celebrate" && (
            <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full border-2 border-[#1a1208] bg-white text-[#1a1208]">
              <CheckIcon className="size-3" />
            </span>
          )}
          <span className="mb-1 block text-3xl leading-none" aria-hidden>
            😎
          </span>
          <span className="cm-comic-label cm-comic-pop-text block text-xl leading-tight text-white">
            Celebrate
          </span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("roast")}
          aria-pressed={mode === "roast"}
          className={`cm-mode-card cm-mode-roast relative overflow-hidden rounded-2xl border-[3px] border-[#1a1208] p-3 text-left shadow-[4px_4px_0_#1a1208] transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1208] ${
            mode === "roast" ? "ring-2 ring-[#1a1208] ring-offset-2 ring-offset-[#fff5d6]" : "opacity-90"
          }`}
        >
          {mode === "roast" && (
            <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full border-2 border-[#1a1208] bg-white text-[#1a1208]">
              <CheckIcon className="size-3" />
            </span>
          )}
          <span className="mb-1 block text-3xl leading-none" aria-hidden>
            🔥
          </span>
          <span className="cm-comic-label cm-comic-pop-text block text-xl leading-tight text-white">
            Roast
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex px-4 pb-2">
      <div className="flex w-full items-center rounded-full border border-[var(--cm-border-soft)] bg-black/30 p-0.5">
        <button
          type="button"
          onClick={() => onModeChange("celebrate")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
            mode === "celebrate"
              ? "bg-[var(--cm-green)] text-[#04120b] shadow-[0_0_14px_rgba(0,230,118,0.5)]"
              : "text-[var(--cm-text-muted)]"
          }`}
        >
          <span aria-hidden>🎉</span>
          Celebrate
        </button>
        <button
          type="button"
          onClick={() => onModeChange("roast")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
            mode === "roast"
              ? "bg-[var(--cm-purple)] text-white shadow-[0_0_14px_rgba(168,85,247,0.6)]"
              : "text-[var(--cm-text-muted)]"
          }`}
        >
          <span aria-hidden>🔥</span>
          Roast
        </button>
      </div>
    </div>
  );
}
