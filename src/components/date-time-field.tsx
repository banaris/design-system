import { Input } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type DateTimeFieldProps = Omit<
  ComponentProps<typeof Input>,
  "className" | "render" | "type"
> & {
  className?: string;
};

/** A `datetime-local` input; `value` is the browser's own string, unmodified. */
export function DateTimeField({ className, ...rest }: DateTimeFieldProps) {
  return (
    <Input
      type="datetime-local"
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "[color-scheme:light] dark:[color-scheme:dark] [&::-webkit-datetime-edit-fields-wrapper]:p-0",
        className,
      )}
      {...rest}
    />
  );
}
