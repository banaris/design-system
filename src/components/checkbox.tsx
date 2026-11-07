import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { CheckIcon, DashIcon } from "../lib/control-icons";

export type CheckboxProps = Omit<
  ComponentProps<typeof BaseCheckbox.Root>,
  "className" | "render" | "children"
> & {
  className?: string;
};

/** A checkbox; label it by wrapping it in a `<label>` or inside a `Field`. `indeterminate` shows a dash. */
export function Checkbox({ className, ...rest }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      className={cn(
        "box-border inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent",
        CONTROL_SURFACE,
        className,
      )}
      {...rest}
    >
      <BaseCheckbox.Indicator className="text-fill data-disabled:text-ink-faint flex forced-colors:text-[CanvasText] data-disabled:forced-colors:text-[GrayText]">
        <CheckIcon className="size-4 in-data-indeterminate:hidden" />
        <DashIcon className="hidden size-4 in-data-indeterminate:block" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
