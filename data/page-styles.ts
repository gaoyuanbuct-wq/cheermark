import type { PageStyle } from "@/types/cheermark";

export interface PageStyleOption {
  id: PageStyle;
  name: string;
  /** Short label shown on the header toggle */
  shortLabel: string;
  tagline: string;
  emoji: string;
  backgroundUrl: string;
}

export const pageStyles: PageStyleOption[] = [
  {
    id: "stadium",
    name: "Stadium Night",
    shortLabel: "Night",
    tagline: "Dark cinematic look",
    emoji: "🌃",
    backgroundUrl: "/styles/stadium-bg.svg",
  },
  {
    id: "comic",
    name: "Comic Pop",
    shortLabel: "Comic",
    tagline: "Cartoon manga look",
    emoji: "💥",
    backgroundUrl: "/styles/comic-bg.svg",
  },
];

export function getPageStyle(id: PageStyle): PageStyleOption {
  return pageStyles.find((s) => s.id === id) ?? pageStyles[0];
}
