import type { ComponentProps, ReactNode } from "react";

import { STATUS_TONE, type StatusTone } from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  DangerIcon,
  InfoIcon,
  SuccessIcon,
  WarningIcon,
} from "../lib/control-icons";

const STATUS_ICON = {
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
  info: InfoIcon,
} satisfies Record<StatusTone, unknown>;

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
  const StatusIcon = STATUS_ICON[status];
  return (
    <div
      role={status === "danger" || status === "warning" ? "alert" : "status"}
      className={cn(
        "box-border flex gap-3 rounded-md border border-s-4 border-solid px-4 py-3 text-base",
        STATUS_TONE[status],
        "border-s-(color:--status)",
        className,
      )}
      {...rest}
    >
      <StatusIcon className="mt-1 size-4 shrink-0 text-(color:--status)" />
      <div className="min-w-0 flex-1">
        {title !== undefined && (
          <p className="text-ink font-semibold">{title}</p>
        )}
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
