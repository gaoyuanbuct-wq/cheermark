"use client";

import type { PageStyle } from "@/types/cheermark";
import { pageStyles } from "@/data/page-styles";

interface StylePickerProps {
  pageStyle: PageStyle;
  onPageStyleChange: (style: PageStyle) => void;
}

/** Header look switch — emoji + short label so first-time users get it instantly. */
export function StylePicker({ pageStyle, onPageStyleChange }: StylePickerProps) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="cm-style-quick-label text-[8px] font-bold leading-none tracking-[0.14em] text-[var(--cm-text-muted)]"
        id="cm-style-quick-label"
      >
        LOOK
      </span>
      <div
        className="cm-style-quick inline-flex items-center gap-0.5 rounded-full border border-[var(--cm-border-soft)] bg-black/15 p-0.5"
        role="group"
        aria-labelledby="cm-style-quick-label"
        aria-label="Page look"
      >
        {pageStyles.map((style) => {
          const selected = pageStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onPageStyleChange(style.id)}
              aria-pressed={selected}
              aria-label={`${style.name}: ${style.tagline}`}
              title={`${style.name} — ${style.tagline}`}
              className={`cm-style-quick-btn flex items-center gap-0.5 rounded-full px-2 py-1 text-[9px] font-bold leading-none transition-all ${
                selected
                  ? "bg-[var(--cm-bg-card)] text-[var(--cm-text)] shadow-sm ring-1 ring-[var(--cm-green)]"
                  : "text-[var(--cm-text-muted)] opacity-70 hover:opacity-100"
              }`}
            >
              <span className="text-xs leading-none" aria-hidden>
                {style.emoji}
              </span>
              <span>{style.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
