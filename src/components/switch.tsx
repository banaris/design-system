import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";

import { BOXED_CONTROL_BOX, BOXED_CONTROL_TARGET } from "../lib/class-presets";
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
      className={cn("h-6 w-11", BOXED_CONTROL_TARGET, className)}
      {...rest}
    >
      <span
        className={cn(
          "rounded-pill group-[[data-checked]:not([data-disabled])]:bg-fill h-6 w-11 justify-start forced-colors:group-[[data-checked]:not([data-disabled])]:bg-[Highlight]",
          BOXED_CONTROL_BOX,
        )}
      >
        <BaseSwitch.Thumb className="rounded-pill bg-fill data-checked:bg-on-fill data-disabled:bg-ink-faint data-disabled:data-checked:bg-ink-faint ease-spring ms-1 size-4 translate-x-0 transition-transform duration-[var(--duration-fast)] data-checked:translate-x-4.5 forced-colors:bg-[CanvasText] forced-colors:data-checked:bg-[HighlightText] data-disabled:forced-colors:bg-[GrayText] data-disabled:data-checked:forced-colors:bg-[GrayText]" />
      </span>
    </BaseSwitch.Root>
  );
}
