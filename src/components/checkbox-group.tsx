import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type CheckboxGroupProps = Omit<
  ComponentProps<typeof BaseCheckboxGroup>,
  "className" | "render"
> & {
  className?: string;
};

/** Groups `Checkbox`es sharing one value; put it in a `Fieldset` for a visible name. */
export function CheckboxGroup({ className, ...rest }: CheckboxGroupProps) {
  return (
    <BaseCheckboxGroup
      className={cn("flex flex-col gap-2", className)}
      {...rest}
    />
  );
}
