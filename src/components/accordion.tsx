"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { type ComponentProps, createElement } from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { ChevronIcon } from "../lib/control-icons";

export type AccordionProps = Omit<
  ComponentProps<typeof BaseAccordion.Root>,
  "className" | "render" | "loopFocus"
> & {
  className?: string;
};

/** A stack of sections that each open and close; one opens at a time unless `multiple` is set. */
export function Accordion({ className, ...rest }: AccordionProps) {
  return (
    <BaseAccordion.Root
      className={cn(
        "border-border rounded-ds-md box-border w-full border border-solid",
        className,
      )}
      {...rest}
    />
  );
}

export type AccordionItemProps = Omit<
  ComponentProps<typeof BaseAccordion.Item>,
  "className" | "render"
> & {
  className?: string;
};

/** One section; give it a `value` that is unique within its `Accordion`. */
export function AccordionItem({ className, ...rest }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      className={cn(
        "border-divider border-t border-solid first:rounded-t-[inherit] first:border-t-0 last:rounded-b-[inherit]",
        className,
      )}
      {...rest}
    />
  );
}

export type AccordionTriggerProps = Omit<
  ComponentProps<typeof BaseAccordion.Trigger>,
  "className" | "render"
> & {
  className?: string;
  /** The heading level that wraps the button; pick the one that fits the page outline. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

/** The heading button that opens and closes its section; its children are the section's name. */
export function AccordionTrigger({
  className,
  children,
  headingLevel = 3,
  ...rest
}: AccordionTriggerProps) {
  return (
    <BaseAccordion.Header
      className="m-0 flex rounded-[inherit]"
      render={createElement(`h${String(headingLevel)}`)}
    >
      <BaseAccordion.Trigger
        className={cn(
          "touch-target text-ink text-ds-base hover:not-data-disabled:bg-surface-hover data-disabled:text-ink-faint group box-border flex w-full cursor-pointer items-center justify-between gap-3 rounded-[inherit] border-0 bg-transparent px-4 py-3 text-start font-semibold data-disabled:cursor-not-allowed data-panel-open:rounded-b-none data-disabled:forced-colors:text-[GrayText]",
          TRANSITION_INTERACTIVE,
          FOCUS_RING,
          className,
        )}
        {...rest}
      >
        {children}
        <ChevronIcon className="ease-standard size-4 shrink-0 transition-transform duration-[var(--duration-fast)] group-data-panel-open:rotate-180" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export type AccordionPanelProps = Omit<
  ComponentProps<typeof BaseAccordion.Panel>,
  "className" | "render"
> & {
  className?: string;
};

/** The section's content, shown while its item is open. */
export function AccordionPanel({
  className,
  children,
  ...rest
}: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      className={cn(
        "text-ink text-ds-base ease-standard h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-[var(--duration-base)] data-ending-style:h-0 data-starting-style:h-0",
        className,
      )}
      {...rest}
    >
      <div className="px-4 pt-1 pb-4">{children}</div>
    </BaseAccordion.Panel>
  );
}
