"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import {
  type ComponentProps,
  createContext,
  use,
  useLayoutEffect,
  useState,
} from "react";

import {
  OVERLAY_BACKDROP,
  OVERLAY_DESCRIPTION,
  OVERLAY_POPUP,
  OVERLAY_TITLE,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  renderTriggerButton,
  type TriggerButtonStyle,
} from "../lib/trigger-button";

export type DrawerSide = "bottom" | "left" | "right";

const DEFAULT_SIDE: DrawerSide = "bottom";

const SWIPE_DIRECTION = {
  bottom: "down",
  left: "left",
  right: "right",
} as const;

/* Base UI reads `swipeDirection` on the root, but the side is chosen on the
 * content, so the content reports it up to the root through this setter. */
const SideContext = createContext<(side: DrawerSide) => void>(() => undefined);

export type DrawerProps = Omit<
  ComponentProps<typeof BaseDrawer.Root>,
  | "swipeDirection"
  | "snapPoints"
  | "snapToSequentialPoints"
  | "snapPoint"
  | "defaultSnapPoint"
  | "onSnapPointChange"
  | "handle"
>;

/** Owns the open state; put a `DrawerTrigger` and a `DrawerContent` inside. */
export function Drawer(props: DrawerProps) {
  const [side, setSide] = useState<DrawerSide>(DEFAULT_SIDE);
  return (
    <SideContext value={setSide}>
      <BaseDrawer.Root {...props} swipeDirection={SWIPE_DIRECTION[side]} />
    </SideContext>
  );
}

export type DrawerTriggerProps = Omit<
  ComponentProps<typeof BaseDrawer.Trigger>,
  "className" | "render" | "handle" | "payload"
> &
  TriggerButtonStyle;

export function DrawerTrigger({
  variant,
  size,
  pill,
  className,
  children,
  ...rest
}: DrawerTriggerProps) {
  return (
    <BaseDrawer.Trigger
      render={renderTriggerButton({ variant, size, pill, className }, children)}
      {...rest}
    />
  );
}

const VIEWPORT_CLASS: Record<DrawerSide, string> = {
  bottom: "items-end justify-center",
  left: "items-stretch justify-start",
  right: "items-stretch justify-end",
};

/* A transform, not Tailwind's `translate`: Base UI writes its own `transform`
 * while a finger drags, and the two properties would add up. */
const POPUP_CLASS: Record<DrawerSide, string> = {
  bottom:
    "max-h-full w-[32rem] max-w-full [transform:translateY(var(--drawer-swipe-movement-y))] data-ending-style:[transform:translateY(calc(100%+var(--ds-edge-bottom)))] data-starting-style:[transform:translateY(calc(100%+var(--ds-edge-bottom)))]",
  left: "w-80 max-w-full [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:[transform:translateX(calc(-100%-var(--ds-edge-left)))] data-starting-style:[transform:translateX(calc(-100%-var(--ds-edge-left)))]",
  right:
    "w-80 max-w-full [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:[transform:translateX(calc(100%+var(--ds-edge-right)))] data-starting-style:[transform:translateX(calc(100%+var(--ds-edge-right)))]",
};

export type DrawerContentProps = Omit<
  ComponentProps<typeof BaseDrawer.Popup>,
  "className" | "render"
> & {
  className?: string;
  /** The edge the drawer slides in from, and the direction a swipe dismisses it. */
  side?: DrawerSide;
};

/** Name it with a `DrawerTitle`; Escape, an outside press and a swipe toward its edge close it. */
export function DrawerContent({
  className,
  side = DEFAULT_SIDE,
  children,
  ...rest
}: DrawerContentProps) {
  const reportSide = use(SideContext);
  useLayoutEffect(() => {
    reportSide(side);
  }, [reportSide, side]);
  return (
    <BaseDrawer.Portal className="relative z-[var(--z-overlay)]">
      <BaseDrawer.Backdrop className={OVERLAY_BACKDROP} />
      <BaseDrawer.Viewport
        className={cn(
          "fixed inset-0 flex touch-none pt-[var(--ds-edge-top)] pr-[var(--ds-edge-right)] pb-[var(--ds-edge-bottom)] pl-[var(--ds-edge-left)]",
          VIEWPORT_CLASS[side],
        )}
      >
        <BaseDrawer.Popup
          className={cn(
            OVERLAY_POPUP,
            "ease-standard touch-auto overflow-y-auto overscroll-contain p-6 transition-transform duration-[var(--duration-base)]",
            POPUP_CLASS[side],
            className,
          )}
          {...rest}
        >
          <BaseDrawer.Content>{children}</BaseDrawer.Content>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}

export type DrawerTitleProps = Omit<
  ComponentProps<typeof BaseDrawer.Title>,
  "className" | "render"
> & {
  className?: string;
};

export function DrawerTitle({ className, ...rest }: DrawerTitleProps) {
  return (
    <BaseDrawer.Title className={cn(OVERLAY_TITLE, className)} {...rest} />
  );
}

export type DrawerDescriptionProps = Omit<
  ComponentProps<typeof BaseDrawer.Description>,
  "className" | "render"
> & {
  className?: string;
};

export function DrawerDescription({
  className,
  ...rest
}: DrawerDescriptionProps) {
  return (
    <BaseDrawer.Description
      className={cn(OVERLAY_DESCRIPTION, className)}
      {...rest}
    />
  );
}

export type DrawerCloseProps = Omit<
  ComponentProps<typeof BaseDrawer.Close>,
  "className" | "render"
> &
  TriggerButtonStyle;

export function DrawerClose({
  variant = "secondary",
  size,
  pill,
  className,
  children,
  ...rest
}: DrawerCloseProps) {
  return (
    <BaseDrawer.Close
      render={renderTriggerButton({ variant, size, pill, className }, children)}
      {...rest}
    />
  );
}
