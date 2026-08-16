import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactNode } from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type ButtonVariant =
  "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a spinner and block interaction. Implies `disabled`. */
  loading?: boolean;
  /** Render fully rounded instead of the default corner radius. */
  pill?: boolean;
  children: ReactNode;
} & Omit<ComponentProps<typeof BaseButton>, "className" | "render"> & {
    className?: string;
  };

/* ⚠ Disabled state is expressed with `data-disabled:`, never `disabled:`.
 * Base UI's `focusableWhenDisabled` swaps the `disabled` attribute for
 * `aria-disabled` so the control stays reachable by keyboard — and at that
 * point the `:disabled` pseudo-class stops matching, which would leave the
 * button looking enabled AND responding to hover. `data-disabled` is emitted
 * for both routes, so one spelling covers them. */
const BASE = `inline-flex items-center justify-center gap-2 border border-solid box-border font-sans cursor-pointer select-none ${TRANSITION_INTERACTIVE} ${FOCUS_RING} not-data-disabled:active:scale-[0.98] data-disabled:cursor-not-allowed data-disabled:bg-surface-sunken data-disabled:text-ink-faint data-disabled:border-transparent data-disabled:shadow-none data-disabled:forced-colors:text-[GrayText]`;

/* ⚠ Each variant sets background, text and border colour EXACTLY once, and
 * `BASE` sets none of them. Two utilities for one property in a single class
 * string would be resolved by `cn`, but which of them survives would then be
 * an argument-order detail a reader has to reconstruct — so the split is kept
 * at the source. A new variant must name all three.
 *
 * Note `accent` takes `text-on-accent`, not `text-ink`: the accent fill is the
 * same pale green in both themes, so a label following the page's ink would
 * invert to near-white on it in dark. */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-fill border-transparent text-on-fill font-semibold hover:not-data-disabled:bg-fill-hover",
  accent:
    "bg-accent border-transparent text-on-accent font-semibold hover:not-data-disabled:bg-accent-hover",
  secondary:
    "bg-transparent border-control-border text-ink font-semibold hover:not-data-disabled:bg-surface-hover",
  ghost:
    "bg-transparent border-transparent text-accent-soft font-semibold hover:not-data-disabled:bg-surface-hover",
  danger:
    "bg-danger-surface border-danger-border text-danger font-semibold hover:not-data-disabled:bg-danger-surface",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2.5",
  lg: "text-lg px-6 py-3",
};

const SPINNER_SIZE: Record<ButtonSize, string> = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
};

/**
 * The system's action control.
 *
 * Built on Base UI's `Button`, so it keeps that component's disabled and
 * focus semantics. Styling is token-driven; pass `className` to override and
 * it will win over the variant.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  pill = false,
  type = "button",
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <BaseButton
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      /* Order is priority: `className` sits last so a caller's utility beats
         the variant without needing `!`. */
      className={cn(
        BASE,
        pill ? "rounded-pill" : "rounded-md",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          className={cn(
            "rounded-pill animate-[ds-spin_0.6s_linear_infinite] border-2 border-current border-t-transparent",
            SPINNER_SIZE[size],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </BaseButton>
  );
}
