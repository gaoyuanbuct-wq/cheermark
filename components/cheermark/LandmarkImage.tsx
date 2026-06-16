"use client";

import { useState } from "react";
import type { Landmark, PageStyle } from "@/types/cheermark";
import { getLandmarkImageUrl } from "@/lib/cheermark/landmark-image";

interface LandmarkImageProps {
  landmark: Landmark;
  pageStyle: PageStyle;
  alt: string;
  className?: string;
}

export function LandmarkImage({
  landmark,
  pageStyle,
  alt,
  className = "",
}: LandmarkImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback
    ? landmark.imageUrl
    : getLandmarkImageUrl(landmark, pageStyle);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`cm-landmark-img size-full object-cover ${className}`}
      loading="lazy"
      onError={() => {
        if (!useFallback) setUseFallback(true);
      }}
    />
  );
}
