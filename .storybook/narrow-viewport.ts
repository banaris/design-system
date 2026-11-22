import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { expect } from "storybook/test";

/* Storybook's built-in 320px viewport. */
export const REFLOW_VIEWPORT = "mobile1";
const REFLOW_WIDTH_PX = 320;

const overflowing = (root: HTMLElement) =>
  [...root.querySelectorAll("body *")]
    .filter((el) => el.getBoundingClientRect().right > root.clientWidth)
    .slice(0, 5)
    .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
    .join(", ");

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? Object.fromEntries(Object.entries(value))
    : {};

/* Opt out with `parameters.narrowViewport.skip`, naming the part that needs
 * two-dimensional layout. The width check stops a wrong-width run passing. */
export const narrowViewport: ProjectAnnotations<Renderer> = {
  afterEach: async ({ globals, parameters }) => {
    if (asRecord(globals["viewport"])["value"] !== REFLOW_VIEWPORT) return;
    await expect(window.innerWidth).toBe(REFLOW_WIDTH_PX);
    if (typeof asRecord(parameters["narrowViewport"])["skip"] === "string")
      return;
    const root = document.documentElement;
    await expect(
      root.scrollWidth,
      `scrolls sideways at ${String(REFLOW_WIDTH_PX)}px; past the edge: ${overflowing(root)}`,
    ).toBeLessThanOrEqual(root.clientWidth);
  },
};
