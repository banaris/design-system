import { cloneElement, type ComponentProps, type ReactElement } from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type LinkProps = {
  /**
   * Element drawn in place of the `<a>`, typically a router's link.
   * It receives this component's class names and props.
   */
  render?: ReactElement<{ className?: string; children?: unknown }>;
} & ComponentProps<"a">;

const LINK = `touch-target rounded-ds-sm text-accent-soft underline underline-offset-2 visited:text-ink-dim hover:text-ink ${TRANSITION_INTERACTIVE} ${FOCUS_RING}`;

/** An inline link. Hook-free, so a server component can render it. */
export function Link({ render, className, children, ...rest }: LinkProps) {
  const merged = cn(LINK, className);
  if (render === undefined) {
    return (
      <a className={merged} {...rest}>
        {children}
      </a>
    );
  }
  return cloneElement(
    render,
    { ...rest, className: cn(merged, render.props.className) },
    ...(children === undefined ? [] : [children]),
  );
}
