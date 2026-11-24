"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import type { ComponentProps } from "react";

import {
  CONTROL_SURFACE,
  FOCUS_RING,
  MENU_ITEM,
  MENU_POPUP,
  TEXT_ENTRY_BOX,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import { CheckIcon, ChevronIcon } from "../lib/control-icons";
import { usePopupCollisionPadding } from "../lib/safe-area";

export type ComboboxProps = ComponentProps<typeof BaseCombobox.Root>;

/** Owns the value, query and open state; pass `items` so the list filters and the input shows labels. */
export const Combobox = BaseCombobox.Root;

export type ComboboxInputProps = Omit<
  ComponentProps<typeof BaseCombobox.Input>,
  "className" | "render" | "children"
> & {
  className?: string;
};

/** The text input with a chevron; clicking the input opens the list. Name it with `aria-label` or a `Field` label. */
export function ComboboxInput({ className, ...rest }: ComboboxInputProps) {
  return (
    <BaseCombobox.InputGroup className="group/combobox relative flex w-full">
      <BaseCombobox.Input
        className={cn(
          TEXT_ENTRY_BOX,
          CONTROL_SURFACE,
          "w-full min-w-0 pe-10",
          className,
        )}
        {...rest}
      />
      <ChevronIcon className="text-ink-dim group-data-disabled/combobox:text-ink-faint pointer-events-none absolute inset-y-0 end-4 my-auto size-4 forced-colors:text-[CanvasText] group-data-disabled/combobox:forced-colors:text-[GrayText]" />
    </BaseCombobox.InputGroup>
  );
}

export type ComboboxContentProps = Omit<
  ComponentProps<typeof BaseCombobox.Popup>,
  "className" | "render"
> & {
  className?: string;
};

export function ComboboxContent({
  className,
  children,
  ...rest
}: ComboboxContentProps) {
  const collisionPadding = usePopupCollisionPadding();
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        sideOffset={4}
        collisionPadding={collisionPadding}
        className="z-[var(--z-dropdown)]"
      >
        <BaseCombobox.Popup
          className={cn(
            MENU_POPUP,
            "min-w-[min(var(--anchor-width),var(--available-width))]",
            className,
          )}
          {...rest}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export type ComboboxListProps = Omit<
  ComponentProps<typeof BaseCombobox.List>,
  "className" | "render"
> & {
  className?: string;
};

/** Holds the options; with `items` on `Combobox`, pass a function that renders one option. */
export function ComboboxList({ className, ...rest }: ComboboxListProps) {
  return (
    <BaseCombobox.List
      className={cn(
        "coarse:flex coarse:flex-col coarse:gap-2 max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain outline-none data-empty:hidden",
        className,
      )}
      {...rest}
    />
  );
}

export type ComboboxItemProps = Omit<
  ComponentProps<typeof BaseCombobox.Item>,
  "className" | "render"
> & {
  className?: string;
};

export function ComboboxItem({
  className,
  children,
  ...rest
}: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      className={cn(MENU_ITEM, FOCUS_RING, "justify-between", className)}
      {...rest}
    >
      <span className="min-w-0">{children}</span>
      <BaseCombobox.ItemIndicator className="flex shrink-0 forced-colors:text-[CanvasText]">
        <CheckIcon className="size-4" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

export type ComboboxEmptyProps = Omit<
  ComponentProps<typeof BaseCombobox.Empty>,
  "className" | "render"
> & {
  className?: string;
};

/** Shown while no option matches the query; its text is announced politely. */
export function ComboboxEmpty({ className, ...rest }: ComboboxEmptyProps) {
  return (
    <BaseCombobox.Empty
      className={cn(
        "text-ds-base text-ink-dim px-3 py-2 empty:hidden",
        className,
      )}
      {...rest}
    />
  );
}
