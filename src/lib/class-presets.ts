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
  "touch-target box-border rounded-ds-md bg-transparent px-4 py-2.5 text-input text-ink placeholder:text-ink-faint";

/* The root is the pointer target; a child draws the box and reads root state via group `control`. */
export const BOXED_CONTROL_TARGET =
  "group/control touch-target inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:z-10 focus-visible:outline-hidden data-disabled:cursor-not-allowed";

export const BOXED_CONTROL_BOX = `box-border inline-flex shrink-0 items-center border border-solid border-control-border ${TRANSITION_INTERACTIVE} group-focus-visible/control:shadow-focus group-[[aria-invalid=true]:not([data-disabled])]/control:border-danger group-data-disabled/control:border-transparent group-data-disabled/control:bg-surface-sunken group-data-disabled/control:text-ink-faint group-data-disabled/control:forced-colors:text-[GrayText]`;

/* `data-highlighted` is Base UI's roving highlight; it follows both the pointer
 * and the arrow keys, so hover needs no separate rule. */
export const MENU_ITEM =
  "touch-target box-border flex w-full cursor-pointer wrap-anywhere items-center gap-2 rounded-ds-sm px-3 py-2 text-ds-base text-ink select-none data-highlighted:not-data-disabled:bg-surface-hover data-disabled:cursor-not-allowed data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]";

export const MENU_POPUP =
  "border-border bg-surface shadow-overlay coarse:flex coarse:flex-col coarse:gap-2 box-border max-w-[var(--available-width)] min-w-40 rounded-ds-md border border-solid p-1 font-ds-sans outline-none";

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
  "border-border bg-surface shadow-overlay text-ink box-border rounded-ds-lg border border-solid font-ds-sans outline-none";

export const OVERLAY_BACKDROP =
  "fixed inset-0 animate-[ds-fade-in_var(--duration-base)_var(--ease-standard)] bg-black/40 transition-opacity duration-[var(--duration-fast)] data-ending-style:opacity-0";

export const OVERLAY_TITLE = "text-h3 text-ink font-ds-sans";

export const OVERLAY_DESCRIPTION = "text-small text-ink-dim mt-2";

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
