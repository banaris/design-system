import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type SwitchProps = Omit<
  ComponentProps<typeof BaseSwitch.Root>,
  "className" | "render" | "children"
> & {
  className?: string;
};

/** An on/off switch; label it by wrapping it in a `<label>` or inside a `Field`. */
export function Switch({ className, ...rest }: SwitchProps) {
  return (
    <BaseSwitch.Root
      className={cn(
        "rounded-pill data-checked:not-data-disabled:bg-fill box-border inline-flex h-6 w-11 shrink-0 cursor-pointer items-center bg-transparent forced-colors:data-checked:not-data-disabled:bg-[Highlight]",
        CONTROL_SURFACE,
        className,
      )}
      {...rest}
    >
      <BaseSwitch.Thumb className="rounded-pill bg-fill data-checked:bg-on-fill data-disabled:bg-ink-faint data-disabled:data-checked:bg-ink-faint ease-spring ms-1 size-4 translate-x-0 transition-transform duration-[var(--duration-fast)] data-checked:translate-x-4.5 forced-colors:bg-[CanvasText] forced-colors:data-checked:bg-[HighlightText] data-disabled:forced-colors:bg-[GrayText] data-disabled:data-checked:forced-colors:bg-[GrayText]" />
    </BaseSwitch.Root>
  );
}
