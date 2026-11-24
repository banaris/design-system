import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";
import { BASE } from "./button";

export type ToggleSize = "sm" | "md" | "lg";

export type ToggleProps = Omit<
  ComponentProps<typeof BaseToggle>,
  "className" | "render"
> & {
  className?: string;
  size?: ToggleSize;
};

const SIZE: Record<ToggleSize, string> = {
  sm: "text-ds-sm px-3 py-1.5",
  md: "text-ds-base px-4 py-2.5",
  lg: "text-ds-lg px-6 py-3",
};

/** A button that stays pressed or not, such as bold in a toolbar; use `Switch` for a setting. */
export function Toggle({ className, size = "md", ...rest }: ToggleProps) {
  return (
    <BaseToggle
      className={cn(
        BASE,
        "rounded-ds-md border-control-border text-ink hover:not-data-disabled:bg-surface-hover data-pressed:not-data-disabled:bg-fill data-pressed:not-data-disabled:text-on-fill data-pressed:hover:not-data-disabled:bg-fill-hover data-pressed:data-disabled:bg-ink-faint data-pressed:data-disabled:text-surface bg-transparent font-semibold data-pressed:not-data-disabled:border-transparent forced-colors:data-pressed:not-data-disabled:bg-[Highlight] forced-colors:data-pressed:not-data-disabled:text-[HighlightText] forced-colors:data-pressed:hover:not-data-disabled:bg-[Highlight] forced-colors:data-pressed:data-disabled:bg-[GrayText] forced-colors:data-pressed:data-disabled:text-[Canvas]",
        SIZE[size],
        className,
      )}
      {...rest}
    />
  );
}
