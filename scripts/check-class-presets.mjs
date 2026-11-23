#!/usr/bin/env node
/* `BOXED_CONTROL_BOX` repeats the state styling `CONTROL_SURFACE` defines, in
 * `group-…/control:` form, because the box is a child of the control root and
 * reads root state through the group. The two strings are literal so Tailwind
 * can scan them, which rules out generating one from the other — so this
 * check is what keeps them in step.
 *
 * Every state token (`data-disabled:`, `aria-invalid:`, `focus-visible:`) of
 * `CONTROL_SURFACE` must reappear either mapped into the box or unchanged on
 * `BOXED_CONTROL_TARGET` (the root owns the cursor and focus stacking), and
 * every state token of the box must map back to one in `CONTROL_SURFACE`. */

import {
  BOXED_CONTROL_BOX,
  BOXED_CONTROL_TARGET,
  CONTROL_SURFACE,
} from "../src/lib/class-presets.ts";

const GROUP = "group-";
const INVALID = "aria-invalid:not-data-disabled:";
const INVALID_GROUP =
  "group-[[aria-invalid=true]:not([data-disabled])]/control:";

const tokens = (classes) => classes.split(/\s+/).filter(Boolean);
const isState = (token) =>
  /^(data-disabled|aria-invalid|focus-visible):/.test(token);

const toBoxed = (token) => {
  if (token.startsWith(INVALID))
    return INVALID_GROUP + token.slice(INVALID.length);
  const [, variant, rest] = /^(data-disabled|focus-visible):(.*)$/.exec(token);
  return `${GROUP}${variant}/control:${rest}`;
};

const surface = tokens(CONTROL_SURFACE).filter(isState);
const target = new Set(tokens(BOXED_CONTROL_TARGET));
const box = new Set(
  tokens(BOXED_CONTROL_BOX).filter((t) => t.startsWith(GROUP)),
);

const errors = [];
const mirrored = new Set();

for (const token of surface) {
  const boxed = toBoxed(token);
  if (box.has(boxed)) mirrored.add(boxed);
  else if (!target.has(token))
    errors.push(
      `CONTROL_SURFACE has \`${token}\` but BOXED_CONTROL_BOX lacks \`${boxed}\` and BOXED_CONTROL_TARGET lacks \`${token}\`.`,
    );
}

for (const token of box) {
  if (!mirrored.has(token))
    errors.push(
      `BOXED_CONTROL_BOX has \`${token}\` with no matching state token in CONTROL_SURFACE.`,
    );
}

if (errors.length > 0) {
  console.error("check:class-presets failed\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `check:class-presets ok — ${mirrored.size} state token(s) mirrored into BOXED_CONTROL_BOX`,
);
