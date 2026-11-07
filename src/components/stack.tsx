import type { ComponentProps } from "react";

import { GAP, type GapStep } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type StackDirection = "vertical" | "horizontal";

export type StackProps = {
  direction?: StackDirection;
  gap?: GapStep;
} & ComponentProps<"div">;

const DIRECTION: Record<StackDirection, string> = {
  vertical: "flex-col",
  horizontal: "flex-row",
};

export function Stack({
  direction = "vertical",
  gap = 4,
  className,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn("flex", DIRECTION[direction], GAP[gap], className)}
      {...rest}
    />
  );
}
