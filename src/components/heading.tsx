import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type HeadingLevel = 1 | 2 | 3;
export type HeadingSize = "display" | "h1" | "h2" | "h3";

export type HeadingProps = {
  level: HeadingLevel;
  size?: HeadingSize;
} & ComponentProps<"h1">;

const ELEMENT = { 1: "h1", 2: "h2", 3: "h3" } as const;

const SIZE: Record<HeadingSize, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
};

/** `level` sets the outline screen readers navigate by; `size` is only the look. */
export function Heading({ level, size, className, ...rest }: HeadingProps) {
  const Element = ELEMENT[level];
  return (
    <Element
      className={cn(SIZE[size ?? ELEMENT[level]], className)}
      {...rest}
    />
  );
}
