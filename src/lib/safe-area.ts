"use client";

import { useMemo, useSyncExternalStore } from "react";

const BASE_UI_PADDING_PX = 5;

const SIDES = ["top", "right", "bottom", "left"] as const;

const NO_INSETS = "0 0 0 0";

function readInsets() {
  const style = getComputedStyle(document.documentElement);
  return SIDES.map((side) =>
    Number.parseFloat(style.getPropertyValue(`--ds-safe-${side}`)),
  ).join(" ");
}

/* Orientation changes fire `resize`, and a landscape cutout moves the insets. */
function subscribe(notify: () => void) {
  window.addEventListener("resize", notify);
  return () => {
    window.removeEventListener("resize", notify);
  };
}

/* `collisionPadding` takes numbers only, so the `--ds-safe-*` insets are read here. */
export function usePopupCollisionPadding() {
  const insets = useSyncExternalStore(subscribe, readInsets, () => NO_INSETS);
  return useMemo(() => {
    const [top = 0, right = 0, bottom = 0, left = 0] = insets
      .split(" ")
      .map((inset) => Math.max(BASE_UI_PADDING_PX, Number(inset) || 0));
    return { top, right, bottom, left };
  }, [insets]);
}
