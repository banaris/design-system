/* The spacing steps layout primitives accept. A closed set of literal class
 * names: Tailwind's scanner cannot see an interpolated `gap-${n}`. */
export type GapStep = 1 | 2 | 3 | 4 | 6 | 8;

export const GAP: Record<GapStep, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};
