import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  size?: SpinnerSize;
  /** Names the spinner for assistive technology; without it the spinner is decorative. */
  label?: string | undefined;
};

const SIZE: Record<SpinnerSize, string> = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
};

export function Spinner({
  size = "md",
  label,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      role={label === undefined ? undefined : "status"}
      aria-label={label}
      aria-hidden={label === undefined || undefined}
      className={cn(
        "rounded-pill inline-block shrink-0 animate-[ds-spin_0.6s_linear_infinite] border-2 border-current border-t-transparent motion-reduce:animate-none",
        SIZE[size],
        className,
      )}
      {...rest}
    />
  );
}
