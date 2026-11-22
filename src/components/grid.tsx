import type { ComponentProps } from "react";

import { GAP, type GapStep } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type GridColumns = 1 | 2 | 3 | 4;

export type GridProps = {
  columns?: GridColumns;
  gap?: GapStep;
} & ComponentProps<"div">;

/* The count rides a custom property so a caller's `grid-cols-*` replaces the whole
 * rule at every width, and no `grid-cols-1` class competes with a consumer's own. */
const REFLOW =
  "grid-cols-[repeat(var(--ds-grid-columns),minmax(0,1fr))] [--ds-grid-columns:1]";

const COLUMNS: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: `${REFLOW} sm:[--ds-grid-columns:2]`,
  3: `${REFLOW} sm:[--ds-grid-columns:3]`,
  4: `${REFLOW} sm:[--ds-grid-columns:4]`,
};

export function Grid({ columns = 1, gap = 4, className, ...rest }: GridProps) {
  return (
    <div
      className={cn("grid", COLUMNS[columns], GAP[gap], className)}
      {...rest}
    />
  );
}
