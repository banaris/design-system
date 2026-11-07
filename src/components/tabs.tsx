import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type TabsProps = ComponentProps<typeof BaseTabs.Root>;

/** Owns the selected tab; pass `defaultValue` or `value`, and give each `TabsTab` and `TabsPanel` the same `value`. */
export const Tabs = BaseTabs.Root;

export type TabsListProps = Omit<
  ComponentProps<typeof BaseTabs.List>,
  "className" | "render"
> & {
  className?: string;
};

export function TabsList({ className, children, ...rest }: TabsListProps) {
  return (
    <BaseTabs.List
      activateOnFocus
      className={cn(
        "border-border relative flex gap-1 border-b border-solid",
        className,
      )}
      {...rest}
    >
      {children}
      <BaseTabs.Indicator className="bg-fill ease-standard absolute -bottom-px left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] transition-[left,width] duration-[var(--duration-base)]" />
    </BaseTabs.List>
  );
}

export type TabsTabProps = Omit<
  ComponentProps<typeof BaseTabs.Tab>,
  "className" | "render"
> & {
  className?: string;
};

export function TabsTab({ className, ...rest }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      className={cn(
        "text-ink-dim hover:not-data-disabled:text-ink data-active:text-ink data-disabled:text-ink-faint cursor-pointer rounded-sm px-4 py-2.5 text-base font-semibold data-disabled:cursor-not-allowed data-disabled:forced-colors:text-[GrayText]",
        TRANSITION_INTERACTIVE,
        FOCUS_RING,
        className,
      )}
      {...rest}
    />
  );
}

export type TabsPanelProps = Omit<
  ComponentProps<typeof BaseTabs.Panel>,
  "className" | "render"
> & {
  className?: string;
};

export function TabsPanel({ className, ...rest }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      className={cn(
        "text-ink rounded-sm pt-4 text-base",
        FOCUS_RING,
        className,
      )}
      {...rest}
    />
  );
}
