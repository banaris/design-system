import { expect } from "storybook/test";

export async function expectSpinsUnlessReduced(element: Element | null) {
  await expect(element).not.toBeNull();
  if (element === null) return;
  await expect(getComputedStyle(element).animationName).toBe(
    matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "ds-spin",
  );
}
