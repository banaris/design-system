import type { ComponentProps } from "react";

import { ROW_DIVIDER } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type ListProps = ComponentProps<"ul">;
export type ListItemProps = ComponentProps<"li">;

/* No preflight ships with the package, so the UA marker, padding and margin
 * have to be removed here. */
export function List({ className, ...rest }: ListProps) {
  return <ul className={cn("m-0 list-none p-0", className)} {...rest} />;
}

export function ListItem({ className, ...rest }: ListItemProps) {
  return (
    <li
      className={cn(
        ROW_DIVIDER,
        "text-ink px-4 py-3 text-base last:border-b-0",
        className,
      )}
      {...rest}
    />
  );
}
