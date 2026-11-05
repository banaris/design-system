import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type ErrorMessageProps = ComponentProps<"p">;

/** Renders nothing for empty children, so no empty live region is left behind. */
export function ErrorMessage({
  children,
  className,
  ...rest
}: ErrorMessageProps) {
  if (children === null || children === undefined || children === false)
    return null;
  if (children === "") return null;
  return (
    <p
      role="alert"
      className={cn("text-small text-danger", className)}
      {...rest}
    >
      {children}
    </p>
  );
}
