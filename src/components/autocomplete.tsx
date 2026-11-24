"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import type { ComponentProps, JSX } from "react";

import {
  CONTROL_SURFACE,
  FOCUS_RING,
  MENU_ITEM,
  TEXT_ENTRY_BOX,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import { PopupHiddenProvider, usePopupHidden } from "../lib/popup-hidden";

export type AutocompleteProps = ComponentProps<typeof BaseAutocomplete.Root>;

/** Owns the typed text (`value`) and open state; pass `items` so the list filters by that text. */
export function Autocomplete<
  // `any` mirrors Base UI's own overload so the public type stays identical.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Items extends readonly { items: readonly any[] }[],
>(
  props: Omit<
    BaseAutocomplete.Root.Props<Items[number]["items"][number]>,
    "items"
  > & { items: Items },
): JSX.Element;
export function Autocomplete<ItemValue>(
  props: Omit<BaseAutocomplete.Root.Props<ItemValue>, "items"> & {
    items?: readonly ItemValue[] | undefined;
  },
): JSX.Element;
export function Autocomplete(props: AutocompleteProps) {
  return (
    <PopupHiddenProvider>
      <BaseAutocomplete.Root {...props} />
    </PopupHiddenProvider>
  );
}

export type AutocompleteInputProps = Omit<
  ComponentProps<typeof BaseAutocomplete.Input>,
  "className" | "render" | "children"
> & {
  className?: string;
};

/** The text field; its text is the value. Name it with `aria-label` or a `Field` label. */
export function AutocompleteInput({
  className,
  ...rest
}: AutocompleteInputProps) {
  const popupHidden = usePopupHidden();
  return (
    <BaseAutocomplete.Input
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "w-full min-w-0",
        className,
      )}
      {...(popupHidden && {
        "aria-expanded": false,
        "aria-controls": undefined,
      })}
      {...rest}
    />
  );
}

export type AutocompleteItemProps = Omit<
  ComponentProps<typeof BaseAutocomplete.Item>,
  "className" | "render"
> & {
  className?: string;
};

/** One suggestion; choosing it puts its label in the input. */
export function AutocompleteItem({
  className,
  ...rest
}: AutocompleteItemProps) {
  return (
    <BaseAutocomplete.Item
      className={cn(MENU_ITEM, FOCUS_RING, className)}
      {...rest}
    />
  );
}
