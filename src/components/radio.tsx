import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE } from "../lib/class-presets";
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

/** Groups `Radio`s; give it an accessible name (`aria-label`/`aria-labelledby`). */
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
      className={cn(
        "rounded-pill in-[[role=radiogroup][aria-invalid=true]]:not-data-disabled:border-danger box-border inline-flex size-5 shrink-0 cursor-pointer items-center justify-center bg-transparent",
        CONTROL_SURFACE,
        className,
      )}
      {...rest}
    >
      <BaseRadio.Indicator className="rounded-pill bg-fill data-disabled:bg-ink-faint size-2.5 forced-colors:bg-[CanvasText] data-disabled:forced-colors:bg-[GrayText]" />
    </BaseRadio.Root>
  );
}
