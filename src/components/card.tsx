import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type CardProps = ComponentProps<"div">;

export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface text-ink border-border shadow-soft rounded-lg border border-solid p-5",
        className,
      )}
      {...rest}
    />
  );
}
