import type { ComponentProps } from "react";

import { STATUS_TONE, type StatusTone } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type BadgeProps = ComponentProps<"span"> & {
  /** Without a status the badge is neutral. */
  status?: StatusTone;
};

export function Badge({ status, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-pill text-ink text-small box-border inline-flex items-center border border-solid px-2.5 py-0.5 font-semibold",
        status === undefined
          ? "bg-surface-sunken border-border"
          : STATUS_TONE[status],
        className,
      )}
      {...rest}
    />
  );
}
