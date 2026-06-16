import type { Landmark, PageStyle } from "@/types/cheermark";

/** Comic variants — filtered from realistic PNGs in public/landmarks/comic/. */
export function getLandmarkImageUrl(
  landmark: Landmark,
  pageStyle: PageStyle,
): string {
  if (pageStyle === "comic") {
    return `/landmarks/comic/${landmark.id}.png`;
  }
  return landmark.imageUrl;
}
