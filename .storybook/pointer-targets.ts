import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { expect } from "storybook/test";

/* ADR 0002 floor and gap, written out so the `touch-target` utility cannot move the bar. */
const FLOOR_PX = 44;
const GAP_PX = 8;
const TOLERANCE_PX = 0.01;

const SLIDER_CONTROL = '[class~="touch-pan-y"]';

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
  SLIDER_CONTROL,
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
    const unitOf = (el: Element) => el.closest("label") ?? el;
    const units = new Set(targets.map(unitOf));
    for (const unit of units) {
      const next = unit.nextElementSibling;
      if (next === null || !units.has(next)) continue;
      const gap = gapBetween(
        unit.getBoundingClientRect(),
        next.getBoundingClientRect(),
      );
      /* Calendar days touch (ADR 0002 records the exception) but never overlap. */
      const floor = unit.getAttribute("role") === "gridcell" ? 0 : GAP_PX;
      await expect(
        gap,
        `${describe(unit)} is ${gap.toFixed(1)}px from ${describe(next)}`,
      ).toBeGreaterThanOrEqual(floor - TOLERANCE_PX);
    }
  },
};
