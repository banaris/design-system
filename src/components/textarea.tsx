import { Input } from "@base-ui/react/input";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentProps } from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TextareaProps = Omit<
  ComponentProps<typeof Input>,
  "className" | "render"
> &
  Pick<ComponentProps<"textarea">, "rows" | "cols" | "wrap"> & {
    className?: string;
  };

/** A multi-line `TextField`; also takes `rows`, `cols` and `wrap`. Mark it invalid with `aria-invalid`. */
export function Textarea({
  className,
  rows,
  cols,
  wrap,
  ...rest
}: TextareaProps) {
  return (
    <Input
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "min-h-24 resize-y",
        className,
      )}
      render={(props) => (
        <textarea {...mergeProps<"textarea">(props, { rows, cols, wrap })} />
      )}
      {...rest}
    />
  );
}
