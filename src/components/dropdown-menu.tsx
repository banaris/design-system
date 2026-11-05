import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";

import { FOCUS_RING, MENU_ITEM } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

export type DropdownMenuProps = ComponentProps<typeof BaseMenu.Root>;

/** Owns the open state; put a `DropdownMenuTrigger` and a `DropdownMenuContent` inside. */
export const DropdownMenu = BaseMenu.Root;

export type DropdownMenuTriggerProps = Omit<
  ComponentProps<typeof BaseMenu.Trigger>,
  "className" | "render"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  className?: string;
};

/** The `Button` that opens the menu; Base UI sets `aria-haspopup` and `aria-expanded`. */
export function DropdownMenuTrigger({
  variant,
  size,
  pill,
  className,
  children,
  ...rest
}: DropdownMenuTriggerProps) {
  return (
    <BaseMenu.Trigger
      render={(props) => (
        <Button
          {...props}
          className={cn(props.className, className)}
          {...(variant !== undefined && { variant })}
          {...(size !== undefined && { size })}
          {...(pill !== undefined && { pill })}
        >
          {children}
        </Button>
      )}
      {...rest}
    />
  );
}

export type DropdownMenuContentProps = Omit<
  ComponentProps<typeof BaseMenu.Popup>,
  "className" | "render"
> & {
  className?: string;
};

export function DropdownMenuContent({
  className,
  ...rest
}: DropdownMenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={4} className="z-[var(--z-dropdown)]">
        <BaseMenu.Popup
          className={cn(
            "border-border bg-surface shadow-overlay box-border min-w-40 rounded-md border border-solid p-1 font-sans outline-none",
            className,
          )}
          {...rest}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export type DropdownMenuItemProps = Omit<
  ComponentProps<typeof BaseMenu.Item>,
  "className" | "render"
> & {
  className?: string;
};

export function DropdownMenuItem({
  className,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <BaseMenu.Item className={cn(MENU_ITEM, FOCUS_RING, className)} {...rest} />
  );
}

export type DropdownMenuLinkItemProps = Omit<
  ComponentProps<typeof BaseMenu.LinkItem>,
  "className" | "render"
> & {
  className?: string;
};

export function DropdownMenuLinkItem({
  className,
  ...rest
}: DropdownMenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem
      className={cn(MENU_ITEM, FOCUS_RING, "no-underline", className)}
      {...rest}
    />
  );
}
