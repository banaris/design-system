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
  /** Names the input; inside a `Field` its label does this instead. */
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
};

const STEP_BUTTON = cn(BASE, VARIANT.secondary, "rounded-ds-md px-3");

/** A numeric input with buttons that step the value; typed text is read in the user's locale. */
export function NumberField({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: NumberFieldProps) {
  return (
    <BaseNumberField.Root
      className={cn("box-border inline-flex flex-col", className)}
      {...rest}
    >
      <BaseNumberField.Group className="box-border flex items-stretch gap-2">
        <BaseNumberField.Decrement
          aria-label="Decrease"
          className={STEP_BUTTON}
        >
          <DashIcon className="size-4" />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            TEXT_ENTRY_BOX,
            CONTROL_SURFACE,
            "w-24 min-w-0 text-center tabular-nums",
          )}
        />
        <BaseNumberField.Increment
          aria-label="Increase"
          className={STEP_BUTTON}
        >
          <PlusIcon className="size-4" />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
