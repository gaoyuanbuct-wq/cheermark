"use client";

import type { Mode, PageStyle } from "@/types/cheermark";
import { BallIcon, QuestionIcon } from "@/components/cheermark/icons";
import { StylePicker } from "@/components/cheermark/StylePicker";
import { ModeToggle } from "@/components/cheermark/ModeToggle";

interface TopBarProps {
  mode: Mode;
  pageStyle: PageStyle;
  onModeChange: (mode: Mode) => void;
  onPageStyleChange: (style: PageStyle) => void;
  onHelp: () => void;
}

export function TopBar({
  mode,
  pageStyle,
  onModeChange,
  onPageStyleChange,
  onHelp,
}: TopBarProps) {
  const isComic = pageStyle === "comic";

  return (
    <header className="cm-topbar sticky top-0 z-40 border-b border-[var(--cm-border-soft)] bg-[var(--cm-bg)]/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="cm-logo-ball grid size-9 shrink-0 place-items-center rounded-full border border-[var(--cm-green)] text-[var(--cm-green)] shadow-[0_0_12px_rgba(0,230,118,0.35)]">
            <BallIcon className="size-5" />
          </span>
          <div className="cm-logo-mark min-w-0 leading-tight">
            <div
              className={`text-lg font-black tracking-tight text-[var(--cm-text)] ${
                isComic ? "cm-style-heading" : ""
              }`}
            >
              Cheer
              <span className="text-[var(--cm-green)]">Mark</span>
            </div>
            <div
              className={`text-[9px] text-[var(--cm-text-muted)] ${
                isComic ? "cm-comic-script text-[11px]" : ""
              }`}
            >
              {isComic ? "Make the city glow!" : "Cheer your mark. Light the city."}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <StylePicker
            pageStyle={pageStyle}
            onPageStyleChange={onPageStyleChange}
          />
          <button
            onClick={onHelp}
            className="grid size-8 place-items-center rounded-full border border-[var(--cm-border-soft)] text-[var(--cm-text-muted)]"
            aria-label="Help"
          >
            <QuestionIcon className="size-4" />
          </button>
        </div>
      </div>

      <ModeToggle mode={mode} pageStyle={pageStyle} onModeChange={onModeChange} />
    </header>
  );
}
