import { beforeEach, expect } from "vitest";

beforeEach(() => {
  expect(matchMedia("(any-pointer: coarse)").matches).toBe(false);
});
