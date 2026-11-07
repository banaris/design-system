import type { ComponentProps, ReactNode } from "react";

import { STATUS_TONE, type StatusTone } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type AlertProps = Omit<ComponentProps<"div">, "title"> & {
  status?: StatusTone;
  title?: ReactNode;
};

/** `danger` and `warning` interrupt assistive technology (`alert`); the others wait their turn (`status`). */
export function Alert({
  status = "info",
  title,
  className,
  children,
  ...rest
}: AlertProps) {
  return (
    <div
      role={status === "danger" || status === "warning" ? "alert" : "status"}
      className={cn(
        "box-border rounded-md border border-s-4 border-solid px-4 py-3 text-base",
        STATUS_TONE[status],
        "border-s-(color:--status)",
        className,
      )}
      {...rest}
    >
      {title !== undefined && <p className="text-ink font-semibold">{title}</p>}
      <div className="text-ink">{children}</div>
    </div>
  );
}
