import type { ComponentProps } from "react";

import { ROW_DIVIDER } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TableProps = ComponentProps<"table">;
export type TableHeaderProps = ComponentProps<"thead">;
export type TableBodyProps = ComponentProps<"tbody">;
export type TableFooterProps = ComponentProps<"tfoot">;
export type TableRowProps = ComponentProps<"tr">;
export type TableHeadProps = ComponentProps<"th">;
export type TableCellProps = ComponentProps<"td">;

/* A row divider is a `<tr>` border, which renders only under `border-collapse`. */
export function Table({ className, ...rest }: TableProps) {
  return (
    <table
      className={cn("w-full border-collapse text-left", className)}
      {...rest}
    />
  );
}

export function TableHeader({ className, ...rest }: TableHeaderProps) {
  return (
    <thead className={cn("border-border border-b", className)} {...rest} />
  );
}

export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />;
}

export function TableFooter({ className, ...rest }: TableFooterProps) {
  return (
    <tfoot className={cn("border-border border-t", className)} {...rest} />
  );
}

export function TableRow({ className, ...rest }: TableRowProps) {
  return (
    <tr
      className={cn(ROW_DIVIDER, "hover:bg-surface-hover", className)}
      {...rest}
    />
  );
}

export function TableHead({ className, ...rest }: TableHeadProps) {
  return (
    <th
      className={cn(
        "text-label text-ink-dim px-4 py-3 text-left uppercase",
        className,
      )}
      {...rest}
    />
  );
}

export function TableCell({ className, ...rest }: TableCellProps) {
  return (
    <td className={cn("text-ink px-4 py-3 text-base", className)} {...rest} />
  );
}
