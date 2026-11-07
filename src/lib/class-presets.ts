/* Utility strings shared across components, so a change to the focus ring or
 * the interaction timing lands everywhere at once. */

/* Focus is drawn with shadows because the indicator is TWO rings, and
 * `box-shadow` is the only property that stacks — a single `outline` cannot
 * draw a light ring inside a dark one. See `--shadow-focus` for why one colour
 * is not enough. `z-10` lifts the ring above adjacent siblings that would
 * otherwise paint over it. */
export const FOCUS_RING =
  "outline-none focus-visible:outline-hidden focus-visible:shadow-focus focus-visible:z-10";

/* Named properties rather than `transition-all`, which would also animate
 * layout and make every reflow visible. Colour goes through `standard`;
 * `spring` is reserved for shape and position.
 *
 * ⚠ The duration is written as an arbitrary value, not `duration-fast`.
 * Tailwind v4's `duration-*` takes a number and does NOT read a `--duration-*`
 * theme namespace the way `ease-*` reads `--ease-*` (measured). A named step
 * there generates no rule at all, leaving `transition-duration` at its `0s`
 * fallback — the transition silently never runs. */
export const TRANSITION_INTERACTIVE =
  "transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-standard";

export const CONTROL_SURFACE = `border border-solid border-control-border ${TRANSITION_INTERACTIVE} ${FOCUS_RING} aria-invalid:not-data-disabled:border-danger data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-surface-sunken data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]`;

export const TEXT_ENTRY_BOX =
  "box-border rounded-md bg-transparent px-4 py-2.5 text-base text-ink placeholder:text-ink-faint";

/* `data-highlighted` is Base UI's roving highlight; it follows both the pointer
 * and the arrow keys, so hover needs no separate rule. */
export const MENU_ITEM =
  "box-border flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-base text-ink select-none data-highlighted:not-data-disabled:bg-surface-hover data-disabled:cursor-not-allowed data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]";

export const MENU_POPUP =
  "border-border bg-surface shadow-overlay box-border min-w-40 rounded-md border border-solid p-1 font-sans outline-none";

export const ROW_DIVIDER = "border-t border-divider first:border-t-0";

export type StatusTone = "success" | "warning" | "danger" | "info";

export const STATUS_TONE: Record<StatusTone, string> = {
  success:
    "bg-success-surface border-success-border [--status:var(--color-success)]",
  warning:
    "bg-warning-surface border-warning-border [--status:var(--color-warning)]",
  danger:
    "bg-danger-surface border-danger-border [--status:var(--color-danger)]",
  info: "bg-info-surface border-info-border [--status:var(--color-info)]",
};

export const OVERLAY_POPUP =
  "border-border bg-surface shadow-overlay text-ink box-border rounded-lg border border-solid font-sans outline-none";

/* Enter is a keyframe and exit a transition: Base UI keeps the popup mounted
 * until both finish, and `--duration-*` is zeroed under reduced motion. */
export const OVERLAY_MOTION =
  "animate-[ds-scale-in_var(--duration-base)_var(--ease-standard)] transition-opacity duration-[var(--duration-fast)] ease-standard data-ending-style:opacity-0";

export type GapStep = 1 | 2 | 3 | 4 | 6 | 8;

/* Literal class names: Tailwind's scanner cannot see an interpolated `gap-${n}`. */
export const GAP: Record<GapStep, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};
