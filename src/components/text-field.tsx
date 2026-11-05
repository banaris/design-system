import { Input } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "className" | "render"
> & {
  className?: string;
};

/** A single-line text input; mark it invalid with `aria-invalid`. */
export function TextField({
  type = "text",
  className,
  ...rest
}: TextFieldProps) {
  return (
    <Input
      type={type}
      className={cn(TEXT_ENTRY_BOX, CONTROL_SURFACE, className)}
      {...rest}
    />
  );
}
