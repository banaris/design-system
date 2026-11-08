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
  const named = label !== undefined && label !== "";
  return (
    <Glyph
      className={cn("shrink-0", SIZE[size], className)}
      role={named ? "img" : undefined}
      aria-label={named ? label : undefined}
      aria-hidden={named ? undefined : true}
    />
  );
}
