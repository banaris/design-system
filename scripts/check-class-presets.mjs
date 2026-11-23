#!/usr/bin/env node
/* `BOXED_CONTROL_BOX` repeats the state styling `CONTROL_SURFACE` defines, in
 * `group-…/control:` form because the box reads state from the control root.
 * Both strings stay literal so Tailwind can scan them, which rules out
 * generating one from the other — this check keeps them in step.
 *
 * Every variant token of `CONTROL_SURFACE` must reappear mapped in the box, or
 * unchanged on `BOXED_CONTROL_TARGET` (the root owns the cursor and focus
 * stacking). Every variant token of the box must come from such a mapping. A
 * variant the table below does not know fails the check, so a new state added
 * to one side cannot slip through. */

import {
  BOXED_CONTROL_BOX,
  BOXED_CONTROL_TARGET,
  CONTROL_SURFACE,
} from "../src/lib/class-presets.ts";

const BOXED_PREFIX = {
  "aria-invalid:not-data-disabled:":
    "group-[[aria-invalid=true]:not([data-disabled])]/control:",
  "data-disabled:": "group-data-disabled/control:",
  "focus-visible:": "group-focus-visible/control:",
};

const tokens = (classes) => classes.split(/\s+/).filter(Boolean);
const hasVariant = (token) => token.includes(":");

const errors = [];
const mirrored = new Set();
const box = new Set(tokens(BOXED_CONTROL_BOX).filter(hasVariant));
const target = new Set(tokens(BOXED_CONTROL_TARGET));

for (const token of tokens(CONTROL_SURFACE).filter(hasVariant)) {
  const prefix = Object.keys(BOXED_PREFIX).find((p) => token.startsWith(p));
  if (prefix === undefined) {
    errors.push(
      `CONTROL_SURFACE has \`${token}\`, a variant this check cannot map; add it to BOXED_PREFIX.`,
    );
    continue;
  }
  const boxed = BOXED_PREFIX[prefix] + token.slice(prefix.length);
  if (box.has(boxed)) mirrored.add(boxed);
  else if (!target.has(token))
    errors.push(
      `CONTROL_SURFACE has \`${token}\` but BOXED_CONTROL_BOX lacks \`${boxed}\` and BOXED_CONTROL_TARGET lacks \`${token}\`.`,
    );
}

for (const token of box) {
  if (!mirrored.has(token))
    errors.push(
      `BOXED_CONTROL_BOX has \`${token}\` with no matching variant token in CONTROL_SURFACE.`,
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
