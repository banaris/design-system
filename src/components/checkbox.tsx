import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps } from "react";

import { BOXED_CONTROL_BOX, BOXED_CONTROL_TARGET } from "../lib/class-presets";
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
      className={cn("size-5", BOXED_CONTROL_TARGET, className)}
      {...rest}
    >
      <span
        className={cn("size-5 justify-center rounded-sm", BOXED_CONTROL_BOX)}
      >
        <BaseCheckbox.Indicator className="text-fill data-disabled:text-ink-faint flex forced-colors:text-[CanvasText] data-disabled:forced-colors:text-[GrayText]">
          <CheckIcon className="size-4 in-data-indeterminate:hidden" />
          <DashIcon className="hidden size-4 in-data-indeterminate:block" />
        </BaseCheckbox.Indicator>
      </span>
    </BaseCheckbox.Root>
  );
}
