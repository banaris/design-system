import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";

import { OVERLAY_MOTION, OVERLAY_POPUP } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TooltipProviderProps = ComponentProps<typeof BaseTooltip.Provider>;

/** Shares open delays between tooltips, so moving from one to the next does not wait again. */
export const TooltipProvider = BaseTooltip.Provider;

export type TooltipProps = ComponentProps<typeof BaseTooltip.Root>;

/** Owns the open state; put a `TooltipTrigger` and a `TooltipContent` inside. */
export const Tooltip = BaseTooltip.Root;

export type TooltipTriggerProps = ComponentProps<typeof BaseTooltip.Trigger>;

/** Unstyled: pass `render={<Button … />}` or another focusable element, since a tooltip only describes its trigger. */
export const TooltipTrigger = BaseTooltip.Trigger;

export type TooltipContentProps = Omit<
  ComponentProps<typeof BaseTooltip.Popup>,
  "className" | "render"
> & {
  className?: string;
};

export function TooltipContent({ className, ...rest }: TooltipContentProps) {
  return (
    <BaseTooltip.Portal className="relative z-[var(--z-overlay)]">
      <BaseTooltip.Positioner sideOffset={6}>
        <BaseTooltip.Popup
          className={cn(
            OVERLAY_POPUP,
            OVERLAY_MOTION,
            "text-small rounded-md px-2.5 py-1.5",
            className,
          )}
          {...rest}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
