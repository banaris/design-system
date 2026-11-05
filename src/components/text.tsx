import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type TextVariant = "body" | "small" | "label";
export type TextElement = "p" | "span" | "div";

export type TextProps = {
  variant?: TextVariant;
  as?: TextElement;
  /* No `ref`: `ComponentProps<"p">` would type it as a paragraph ref whatever
     `as` renders. */
} & Omit<ComponentProps<"p">, "ref">;

const VARIANT: Record<TextVariant, string> = {
  body: "text-body",
  small: "text-small",
  label: "text-label",
};

export function Text({
  variant = "body",
  as: Element = "p",
  className,
  ...rest
}: TextProps) {
  return <Element className={cn(VARIANT[variant], className)} {...rest} />;
}
