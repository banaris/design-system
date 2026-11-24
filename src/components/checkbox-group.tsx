"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";
import { useFieldsetState } from "./fieldset";

export type CheckboxGroupProps = Omit<
  ComponentProps<typeof BaseCheckboxGroup>,
  "className" | "render"
> & {
  className?: string;
};

/** Groups `Checkbox`es sharing one value; in a `Fieldset` its legend names the group. */
export function CheckboxGroup({ className, ...rest }: CheckboxGroupProps) {
  const { legendId } = useFieldsetState();
  return (
    <BaseCheckboxGroup
      className={cn("flex flex-col gap-2", className)}
      {...(legendId === undefined ? {} : { "aria-labelledby": legendId })}
      {...rest}
    />
  );
}
