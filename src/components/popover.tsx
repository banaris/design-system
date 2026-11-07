import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps } from "react";

import { OVERLAY_MOTION, OVERLAY_POPUP } from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  renderTriggerButton,
  type TriggerButtonStyle,
} from "../lib/trigger-button";

export type PopoverProps = ComponentProps<typeof BasePopover.Root>;

/** Owns the open state; put a `PopoverTrigger` and a `PopoverContent` inside. */
export const Popover = BasePopover.Root;

export type PopoverTriggerProps = Omit<
  ComponentProps<typeof BasePopover.Trigger>,
  "className" | "render"
> &
  TriggerButtonStyle;

export function PopoverTrigger({
  variant,
  size,
  pill,
  className,
  children,
  ...rest
}: PopoverTriggerProps) {
  return (
    <BasePopover.Trigger
      render={renderTriggerButton({ variant, size, pill, className }, children)}
      {...rest}
    />
  );
}

export type PopoverContentProps = Omit<
  ComponentProps<typeof BasePopover.Popup>,
  "className" | "render"
> & {
  className?: string;
};

/** Escape and an outside press close it; focus returns to the trigger. */
export function PopoverContent({ className, ...rest }: PopoverContentProps) {
  return (
    <BasePopover.Portal className="relative z-[var(--z-overlay)]">
      <BasePopover.Positioner sideOffset={8}>
        <BasePopover.Popup
          className={cn(
            OVERLAY_POPUP,
            OVERLAY_MOTION,
            "max-h-[var(--available-height)] max-w-80 overflow-y-auto p-4",
            className,
          )}
          {...rest}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export type PopoverTitleProps = Omit<
  ComponentProps<typeof BasePopover.Title>,
  "className" | "render"
> & {
  className?: string;
};

export function PopoverTitle({ className, ...rest }: PopoverTitleProps) {
  return (
    <BasePopover.Title
      className={cn("text-ink text-base font-semibold", className)}
      {...rest}
    />
  );
}

export type PopoverDescriptionProps = Omit<
  ComponentProps<typeof BasePopover.Description>,
  "className" | "render"
> & {
  className?: string;
};

export function PopoverDescription({
  className,
  ...rest
}: PopoverDescriptionProps) {
  return (
    <BasePopover.Description
      className={cn("text-small text-ink-dim mt-1", className)}
      {...rest}
    />
  );
}
