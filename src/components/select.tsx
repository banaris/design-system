import { Select as BaseSelect } from "@base-ui/react/select";
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

export type SelectProps = ComponentProps<typeof BaseSelect.Root>;

/** Owns the value and open state; pass `items` so the trigger shows labels, not values. */
export const Select = BaseSelect.Root;

export type SelectTriggerProps = Omit<
  ComponentProps<typeof BaseSelect.Trigger>,
  "className" | "render" | "children"
> & {
  placeholder?: string;
  className?: string;
};

/** The button showing the chosen option; name it with `aria-label` or a `Field` label. */
export function SelectTrigger({
  placeholder,
  className,
  ...rest
}: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "flex w-full cursor-pointer items-center justify-between gap-2 text-start",
        className,
      )}
      {...rest}
    >
      <BaseSelect.Value
        placeholder={placeholder}
        className="data-placeholder:text-ink-faint data-placeholder:data-disabled:forced-colors:text-[GrayText]"
      />
      <BaseSelect.Icon className="text-ink-dim data-disabled:text-ink-faint flex shrink-0 forced-colors:text-[CanvasText] data-disabled:forced-colors:text-[GrayText]">
        <ChevronIcon className="size-4" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export type SelectContentProps = Omit<
  ComponentProps<typeof BaseSelect.Popup>,
  "className" | "render"
> & {
  className?: string;
};

export function SelectContent({ className, ...rest }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        sideOffset={4}
        alignItemWithTrigger={false}
        className="z-[var(--z-dropdown)]"
      >
        <BaseSelect.Popup
          className={cn(MENU_POPUP, "min-w-[var(--anchor-width)]", className)}
          {...rest}
        />
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export type SelectItemProps = Omit<
  ComponentProps<typeof BaseSelect.Item>,
  "className" | "render"
> & {
  className?: string;
};

export function SelectItem({ className, children, ...rest }: SelectItemProps) {
  return (
    <BaseSelect.Item
      className={cn(MENU_ITEM, FOCUS_RING, "justify-between", className)}
      {...rest}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="flex shrink-0 forced-colors:text-[CanvasText]">
        <CheckIcon className="size-4" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
