import { beforeEach, expect } from "vitest";

beforeEach(() => {
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
});
