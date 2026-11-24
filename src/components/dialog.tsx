"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";

import {
  OVERLAY_BACKDROP,
  OVERLAY_DESCRIPTION,
  OVERLAY_MOTION,
  OVERLAY_POPUP,
  OVERLAY_TITLE,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  renderTriggerButton,
  type TriggerButtonStyle,
} from "../lib/trigger-button";

export type DialogProps = ComponentProps<typeof BaseDialog.Root>;

/** Owns the open state; put a `DialogTrigger` and a `DialogContent` inside. */
export const Dialog = BaseDialog.Root;

export type DialogTriggerProps = Omit<
  ComponentProps<typeof BaseDialog.Trigger>,
  "className" | "render"
> &
  TriggerButtonStyle;

export function DialogTrigger({
  variant,
  size,
  pill,
  className,
  children,
  ...rest
}: DialogTriggerProps) {
  return (
    <BaseDialog.Trigger
      render={renderTriggerButton({ variant, size, pill, className }, children)}
      {...rest}
    />
  );
}

export type DialogContentProps = Omit<
  ComponentProps<typeof BaseDialog.Popup>,
  "className" | "render"
> & {
  className?: string;
};

/** Name it with a `DialogTitle`; Escape and an outside press close it. */
export function DialogContent({
  className,
  children,
  ...rest
}: DialogContentProps) {
  return (
    <BaseDialog.Portal className="relative z-[var(--z-overlay)]">
      <BaseDialog.Backdrop className={OVERLAY_BACKDROP} />
      <BaseDialog.Popup
        className={cn(
          OVERLAY_POPUP,
          OVERLAY_MOTION,
          "fixed top-[calc(50%+(var(--ds-edge-top)-var(--ds-edge-bottom))/2)] left-[calc(50%+(var(--ds-edge-left)-var(--ds-edge-right))/2)] max-h-[calc(100dvh-var(--ds-edge-top)-var(--ds-edge-bottom))] w-[min(32rem,calc(100vw-var(--ds-edge-left)-var(--ds-edge-right)))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6",
          className,
        )}
        {...rest}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export type DialogTitleProps = Omit<
  ComponentProps<typeof BaseDialog.Title>,
  "className" | "render"
> & {
  className?: string;
};

export function DialogTitle({ className, ...rest }: DialogTitleProps) {
  return (
    <BaseDialog.Title className={cn(OVERLAY_TITLE, className)} {...rest} />
  );
}

export type DialogDescriptionProps = Omit<
  ComponentProps<typeof BaseDialog.Description>,
  "className" | "render"
> & {
  className?: string;
};

export function DialogDescription({
  className,
  ...rest
}: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      className={cn(OVERLAY_DESCRIPTION, className)}
      {...rest}
    />
  );
}

export type DialogCloseProps = Omit<
  ComponentProps<typeof BaseDialog.Close>,
  "className" | "render"
> &
  TriggerButtonStyle;

export function DialogClose({
  variant = "secondary",
  size,
  pill,
  className,
  children,
  ...rest
}: DialogCloseProps) {
  return (
    <BaseDialog.Close
      render={renderTriggerButton({ variant, size, pill, className }, children)}
      {...rest}
    />
  );
}
