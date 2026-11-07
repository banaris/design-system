import type { ComponentType, SVGProps } from "react";

import { cn } from "../lib/cn";

export type IconSize = "sm" | "md" | "lg";

const SIZE: Record<IconSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export interface IconProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: IconSize;
  /** Accessible name. Omit when text beside the icon already says it, so it is not announced twice. */
  label?: string;
  className?: string;
}

export function Icon({
  icon: Glyph,
  size = "sm",
  label,
  className,
}: IconProps) {
  return (
    <Glyph
      className={cn("shrink-0", SIZE[size], className)}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
    />
  );
}
