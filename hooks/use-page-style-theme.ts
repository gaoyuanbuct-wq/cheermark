"use client";

import { useLayoutEffect } from "react";
import type { PageStyle } from "@/types/cheermark";

/** Sync page style to <html data-page-style> so global theme CSS applies instantly. */
export function usePageStyleTheme(pageStyle: PageStyle) {
  useLayoutEffect(() => {
    document.documentElement.dataset.pageStyle = pageStyle;
  }, [pageStyle]);
}
