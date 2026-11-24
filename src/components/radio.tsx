import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps } from "react";

import { BOXED_CONTROL_BOX, BOXED_CONTROL_TARGET } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type RadioGroupProps = Omit<
  ComponentProps<typeof BaseRadioGroup>,
  "className" | "render"
> & {
  className?: string;
};

export type RadioProps = Omit<
  ComponentProps<typeof BaseRadio.Root>,
  "className" | "render" | "children"
> & {
  className?: string;
};

/** Groups `Radio`s; name it with `aria-label`, or put it in a `Fieldset`. */
export function RadioGroup({ className, ...rest }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      className={cn("flex flex-col gap-2", className)}
      {...rest}
    />
  );
}

/** One option of a `RadioGroup`; label it by wrapping it in a `<label>`. */
export function Radio({ className, ...rest }: RadioProps) {
  return (
    <BaseRadio.Root
      className={cn("size-5", BOXED_CONTROL_TARGET, className)}
      {...rest}
    >
      <span
        className={cn(
          "rounded-pill in-[[role=radiogroup][aria-invalid=true]]:group-[:not([data-disabled])]/control:border-danger size-5 justify-center",
          BOXED_CONTROL_BOX,
        )}
      >
        <BaseRadio.Indicator className="rounded-pill bg-fill data-disabled:bg-ink-faint size-2.5 forced-colors:bg-[CanvasText] data-disabled:forced-colors:bg-[GrayText]" />
      </span>
    </BaseRadio.Root>
  );
}
