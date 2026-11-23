import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { expect } from "storybook/test";

/* ADR 0002 floor and gap, written out so the `touch-target` utility cannot move the bar. */
const FLOOR_PX = 44;
const GAP_PX = 8;
const TOLERANCE_PX = 0.01;

/* Inline links in running text are exempt (WCAG 2.5.8). */
const TARGETS = [
  "button",
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="combobox"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="gridcell"][tabindex]',
  'input:not([type="hidden"], [type="range"], [type="checkbox"], [type="radio"])',
  "textarea",
  '[class~="touch-pan-y"]',
].join(",");

const isRendered = (el: Element) => {
  const box = el.getBoundingClientRect();
  return (
    box.width > 1 && box.height > 1 && el.closest("[aria-hidden]") === null
  );
};

const describe = (el: Element) => {
  const role = el.getAttribute("role");
  const name = el.getAttribute("aria-label") ?? el.textContent;
  return `${el.tagName.toLowerCase()}${role === null ? "" : `[role=${role}]`} "${name.slice(0, 24)}"`;
};

const gapBetween = (a: DOMRect, b: DOMRect) =>
  Math.max(
    b.left - a.right,
    a.left - b.right,
    b.top - a.bottom,
    a.top - b.bottom,
  );

export const pointerTargets: ProjectAnnotations<Renderer> = {
  afterEach: async () => {
    if (!matchMedia("(any-pointer: coarse)").matches) return;
    const targets = [...document.querySelectorAll(TARGETS)].filter(isRendered);
    for (const el of targets) {
      const { width, height } = el.getBoundingClientRect();
      const size = `${describe(el)} is ${width.toFixed(1)}×${height.toFixed(1)}`;
      await expect(width, size).toBeGreaterThanOrEqual(FLOOR_PX - TOLERANCE_PX);
      await expect(height, size).toBeGreaterThanOrEqual(
        FLOOR_PX - TOLERANCE_PX,
      );
    }
    for (const el of targets) {
      const next = el.nextElementSibling;
      if (next === null || !targets.includes(next)) continue;
      if (el.getAttribute("role") === "gridcell") continue;
      const gap = gapBetween(
        el.getBoundingClientRect(),
        next.getBoundingClientRect(),
      );
      await expect(
        gap,
        `${describe(el)} is ${gap.toFixed(1)}px from ${describe(next)}`,
      ).toBeGreaterThanOrEqual(GAP_PX - TOLERANCE_PX);
    }
  },
};
