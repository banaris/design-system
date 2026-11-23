"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps } from "react";

import { OVERLAY_MOTION, OVERLAY_POPUP } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { usePopupCollisionPadding } from "../lib/safe-area";
import {
  fieldTriggerButton,
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
  TriggerButtonStyle & {
    inField?: boolean;
  };

export function PopoverTrigger({
  variant,
  size,
  pill,
  className,
  children,
  inField = false,
  ...rest
}: PopoverTriggerProps) {
  const style = { variant, size, pill, className };
  return (
    <BasePopover.Trigger
      render={
        inField
          ? fieldTriggerButton(style, children)
          : renderTriggerButton(style, children)
      }
      {...rest}
    />
  );
}

export type PopoverContentProps = Omit<
  ComponentProps<typeof BasePopover.Popup>,
  "className" | "render"
> & {
  className?: string;
  /** Where to render the popup; set it to an open native modal `<dialog>` so the popup stays operable inside it. */
  portalContainer?: HTMLElement | null | undefined;
};

/** Escape and an outside press close it; focus returns to the trigger. */
export function PopoverContent({
  className,
  portalContainer,
  ...rest
}: PopoverContentProps) {
  const collisionPadding = usePopupCollisionPadding();
  return (
    <BasePopover.Portal
      container={portalContainer ?? undefined}
      className="relative z-[var(--z-overlay)]"
    >
      <BasePopover.Positioner
        sideOffset={8}
        collisionPadding={collisionPadding}
      >
        <BasePopover.Popup
          className={cn(
            OVERLAY_POPUP,
            OVERLAY_MOTION,
            "max-h-[var(--available-height)] max-w-[min(20rem,var(--available-width))] overflow-y-auto p-4",
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
      className={cn("text-ink text-ds-base font-semibold", className)}
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
