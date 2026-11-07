import { Input } from "@base-ui/react/input";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TextareaProps = Omit<
  ComponentProps<"textarea">,
  "className" | "children"
> & {
  className?: string;
};

/** A multi-line text input; mark it invalid with `aria-invalid`. */
export function Textarea({
  className,
  id,
  name,
  value,
  defaultValue,
  disabled,
  style,
  ...rest
}: TextareaProps) {
  return (
    <Input
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      style={style}
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "min-h-24 resize-y",
        className,
      )}
      render={(props) => <textarea {...mergeProps<"textarea">(props, rest)} />}
    />
  );
}
