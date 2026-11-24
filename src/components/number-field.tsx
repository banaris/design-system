import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { DashIcon, PlusIcon } from "../lib/control-icons";
import { BASE, VARIANT } from "./button";

export type NumberFieldProps = Omit<
  ComponentProps<typeof BaseNumberField.Root>,
  "className" | "render" | "children"
> & {
  className?: string;
  /** Names the button that lowers the value. */
  decrementLabel?: string;
  /** Names the button that raises the value. */
  incrementLabel?: string;
};

const STEP_BUTTON = cn(BASE, VARIANT.secondary, "rounded-ds-md px-3");

/** A numeric input with buttons that step the value; every `aria-*` prop goes on the input, not the wrapper. */
export function NumberField({
  className,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  ...rest
}: NumberFieldProps) {
  const inputAria: Record<string, unknown> = {};
  const rootProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (!key.startsWith("aria-")) rootProps[key] = value;
    else if (value !== undefined) inputAria[key] = value;
  }
  return (
    <BaseNumberField.Root
      className={cn("box-border inline-flex flex-col", className)}
      {...rootProps}
    >
      <BaseNumberField.Group className="box-border flex items-stretch gap-2">
        <BaseNumberField.Decrement
          aria-label={decrementLabel}
          className={STEP_BUTTON}
        >
          <DashIcon className="size-4" />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          {...inputAria}
          className={cn(
            TEXT_ENTRY_BOX,
            CONTROL_SURFACE,
            "w-24 min-w-0 text-center tabular-nums",
          )}
        />
        <BaseNumberField.Increment
          aria-label={incrementLabel}
          className={STEP_BUTTON}
        >
          <PlusIcon className="size-4" />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
