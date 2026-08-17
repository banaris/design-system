/* Utility strings shared across components, so a change to the focus ring or
 * the interaction timing lands everywhere at once. */

/* Focus is drawn with shadows because the indicator is TWO rings, and
 * `box-shadow` is the only property that stacks — a single `outline` cannot
 * draw a light ring inside a dark one. See `--shadow-focus` for why one colour
 * is not enough. `z-10` lifts the ring above adjacent siblings that would
 * otherwise paint over it. */
export const FOCUS_RING =
  "outline-none focus-visible:shadow-focus focus-visible:z-10";

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
