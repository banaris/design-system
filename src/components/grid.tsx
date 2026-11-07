import type { ComponentProps } from "react";

import { GAP, type GapStep } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type GridColumns = 1 | 2 | 3 | 4;

export type GridProps = {
  columns?: GridColumns;
  gap?: GapStep;
} & ComponentProps<"div">;

const COLUMNS: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function Grid({ columns = 1, gap = 4, className, ...rest }: GridProps) {
  return (
    <div
      className={cn("grid", COLUMNS[columns], GAP[gap], className)}
      {...rest}
    />
  );
}
