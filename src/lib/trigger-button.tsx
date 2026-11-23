"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from "../components/button";
import { FieldControl } from "../components/field";
import { cn } from "./cn";

export interface TriggerButtonStyle {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  pill?: boolean | undefined;
  className?: string | undefined;
}

/** A Base UI `render` function that draws the trigger as a `Button`, keeping the props Base UI injects. */
export function renderTriggerButton(
  { variant, size, pill, className }: TriggerButtonStyle,
  children: ReactNode,
) {
  return (props: ComponentProps<"button">) => (
    <Button
      {...props}
      className={cn(props.className, className)}
      {...(variant !== undefined && { variant })}
      {...(size !== undefined && { size })}
      {...(pill !== undefined && { pill })}
    >
      {children}
    </Button>
  );
}

export function fieldTriggerButton(
  style: TriggerButtonStyle,
  children: ReactNode,
) {
  return (
    <FieldControl
      render={(controlProps: ComponentProps<"button">) => {
        const { id, "aria-labelledby": labelledBy } = controlProps;
        const valueId = id === undefined ? undefined : `${id}-value`;
        const named = labelledBy !== undefined && valueId !== undefined;
        return renderTriggerButton(
          style,
          <span id={valueId}>{children}</span>,
        )({
          ...controlProps,
          ...(named && { "aria-labelledby": `${labelledBy} ${valueId}` }),
        });
      }}
    />
  );
}
