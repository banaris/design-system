"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import type { ComponentProps } from "react";

import {
  CONTROL_SURFACE,
  FOCUS_RING,
  MENU_ITEM,
  TEXT_ENTRY_BOX,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  PopupHiddenProvider,
  usePopupHiddenInputProps,
} from "../lib/popup-hidden";

export type AutocompleteProps = ComponentProps<typeof BaseAutocomplete.Root>;

/** Owns the typed text (`value`) and open state; pass `items` so the list filters by that text. */
export const Autocomplete: typeof BaseAutocomplete.Root = function Autocomplete(
  props: AutocompleteProps,
) {
  return (
    <PopupHiddenProvider>
      <BaseAutocomplete.Root {...props} />
    </PopupHiddenProvider>
  );
};

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
  const popupHiddenProps = usePopupHiddenInputProps();
  return (
    <BaseAutocomplete.Input
      className={cn(
        TEXT_ENTRY_BOX,
        CONTROL_SURFACE,
        "w-full min-w-0",
        className,
      )}
      {...popupHiddenProps}
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
