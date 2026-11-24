import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type ProgressProps = Omit<
  ComponentProps<typeof BaseProgress.Root>,
  "className" | "render" | "children"
> & {
  className?: string;
  /** A visible name that also names the bar; without it, set `aria-label` or `aria-labelledby`. */
  label?: string | undefined;
  /** Shows the formatted value beside the label. Nothing is shown while `value` is `null`. */
  showValue?: boolean | undefined;
};

/** A bar for work with a known end; pass `value={null}` while the amount is not known yet. */
export function Progress({
  className,
  label,
  showValue = false,
  ...rest
}: ProgressProps) {
  return (
    <BaseProgress.Root
      className={cn("box-border flex w-full flex-col gap-2", className)}
      {...rest}
    >
      {label !== undefined || showValue ? (
        <div className="text-ds-sm text-ink flex items-baseline justify-between gap-3">
          {label === undefined ? (
            <span />
          ) : (
            <BaseProgress.Label className="font-semibold">
              {label}
            </BaseProgress.Label>
          )}
          {showValue ? (
            <BaseProgress.Value className="text-ink-dim tabular-nums" />
          ) : null}
        </div>
      ) : null}
      <BaseProgress.Track className="rounded-pill bg-surface-sunken border-control-border box-border block h-2 w-full overflow-hidden border border-solid">
        <BaseProgress.Indicator className="bg-fill rounded-pill ease-standard block h-full transition-[width] duration-[var(--duration-base)] data-indeterminate:w-full data-indeterminate:animate-[ds-pulse_1.5s_var(--ease-standard)_infinite] motion-reduce:data-indeterminate:animate-none forced-colors:bg-[Highlight]" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
