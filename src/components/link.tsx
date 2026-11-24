import { mergeProps } from "@base-ui/react/merge-props";
import { cloneElement, type ComponentProps, type ReactElement } from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type LinkProps = {
  /**
   * Element drawn in place of the `<a>`, typically a router's link.
   * It receives this component's class names and props.
   */
  render?: ReactElement<{
    className?: string | ((state: unknown) => string);
    children?: unknown;
  }>;
} & ComponentProps<"a">;

const LINK = `touch-target rounded-ds-sm text-accent-soft underline underline-offset-2 box-decoration-clone visited:text-ink-dim hover:text-ink ${TRANSITION_INTERACTIVE} ${FOCUS_RING}`;

/** An inline link. Hook-free, so a server component can render it. */
export function Link({ render, className, children, ...rest }: LinkProps) {
  if (render === undefined) {
    return (
      <a className={cn(LINK, className)} {...rest}>
        {children}
      </a>
    );
  }
  const own = render.props.className;
  return cloneElement(
    render,
    {
      ...mergeProps(render.props, rest),
      className:
        typeof own === "function"
          ? (state: unknown) => cn(LINK, own(state), className)
          : cn(LINK, own, className),
    },
    ...(children === undefined ? [] : [children]),
  );
}
