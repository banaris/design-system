#!/usr/bin/env node
/* Measures the token palette against WCAG and fails CI when a pair regresses.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * Contrast is the one property of a colour token that cannot be reviewed by
 * looking at it. A hex nudged half a step to "warm it up" reads as an
 * improvement in the diff and in the catalogue, and only fails for the people
 * who most need it to pass. Nothing else in the toolchain measures it: the
 * axe run in `pnpm test` checks the colours a story happens to render, not the
 * contract the tokens are supposed to hold.
 *
 * The comments in `theme.css` quote specific ratios. This is what keeps those
 * numbers honest — they are assertions, not annotations.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 * Every pair below, in BOTH themes, against the threshold its role implies:
 *   - text on a surface            4.5:1  (WCAG 1.4.3)
 *   - a control's own border       3:1    (WCAG 1.4.11)
 *
 * ── What it does not check ─────────────────────────────────────────────
 * Combinations no component produces. Adding a pair here is cheap; adding one
 * that no UI renders makes the suite fail for a situation nobody can see.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "src", "styles", "theme.css");

/* ---- Parse the declared tokens per theme ----
 * Comments are stripped first: `theme.css` documents superseded values in
 * prose ("was #647519, 4.46:1"), and a naive scan would read those as
 * declarations and measure colours that no longer exist. */
const source = readFileSync(THEME, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const blockAfter = (marker, from = 0) => {
  const start = source.indexOf(marker, from);
  if (start === -1) throw new Error(`theme.css no longer contains ${marker}`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i);
    }
  }
  throw new Error(`unbalanced braces after ${marker}`);
};

const parse = (text) => {
  const out = {};
  for (const [, name, value] of text.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
};

const light = parse(blockAfter("@theme"));
const darkOverlay = parse(blockAfter(':root[data-theme="dark"]'));
const dark = { ...light, ...darkOverlay };

/* ---- The two dark blocks must stay identical ----
 * Dark is declared twice — once for the explicit opt-in, once for the OS
 * preference — because a product pinning `data-theme="light"` must not be
 * overridden by the OS. Nothing else compares them, so an edit to one block
 * alone ships a theme that differs by activation route AND leaves the OS-dark
 * path unmeasured by everything below. */
/* The same selector appears inside `@custom-variant dark`, which declares no
   tokens — anchor on the LAST occurrence, which is the overlay. Taking the
   first found an empty block and reported every token as missing. */
const mediaOverlay = parse(
  blockAfter(
    ':root:not([data-theme="light"])',
    source.lastIndexOf("prefers-color-scheme: dark"),
  ),
);
if (Object.keys(mediaOverlay).length === 0) {
  throw new Error(
    "the prefers-color-scheme overlay parsed as empty — this guard is anchored on the wrong block",
  );
}
const blockErrors = [];
for (const name of new Set([
  ...Object.keys(darkOverlay),
  ...Object.keys(mediaOverlay),
])) {
  const a = darkOverlay[name];
  const b = mediaOverlay[name];
  if (a === undefined)
    blockErrors.push(
      `${name} is in the media block but not [data-theme="dark"]`,
    );
  else if (b === undefined)
    blockErrors.push(
      `${name} is in [data-theme="dark"] but not the media block`,
    );
  else if (a !== b)
    blockErrors.push(`${name} differs: [data-theme="dark"]=${a} vs media=${b}`);
}

/* ---- Colour maths ---- */
const hexToRgb = (hex) => {
  const n = hex.replace("#", "");
  const parts = n.length === 3 ? [...n].map((c) => c + c) : n.match(/../g);
  return parts.map((p) => parseInt(p, 16) / 255);
};

/* Only `color-mix(in srgb, A p%, B)` is supported — the one form the tokens
   use. Anything else is reported rather than silently approximated. */
const resolve_ = (value, tokens, seen = new Set()) => {
  /* Whitespace is normalised because prettier wraps these declarations across
     lines; matching the single-line shape alone left the mix branch dead and
     every status plane unresolvable. */
  let v = value.trim().replace(/\s+/g, " ");

  const varMatch = /^var\((--[\w-]+)\)$/.exec(v);
  if (varMatch) {
    const name = varMatch[1];
    if (seen.has(name)) throw new Error(`circular token reference at ${name}`);
    seen.add(name);
    return resolve_(tokens[name], tokens, seen);
  }

  const mix = /^color-mix\(\s*in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+?)\s*\)$/.exec(
    v,
  );
  if (mix) {
    const a = resolve_(mix[1], tokens, new Set(seen));
    const b = resolve_(mix[3], tokens, new Set(seen));
    const w = Number(mix[2]) / 100;
    return a.map((c, i) => c * w + b[i] * (1 - w));
  }

  /* 3 or 6 digits only. A wider range admits alpha forms, whose fourth channel
     has no luminance coefficient and yields NaN — reported as a failure, but
     for the wrong reason. */
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return hexToRgb(v);
  throw new Error(`unsupported colour form: ${v}`);
};

const luminance = (rgb) =>
  rgb
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);

const contrast = (fg, bg, tokens) => {
  const [hi, lo] = [
    luminance(resolve_(fg, tokens)),
    luminance(resolve_(bg, tokens)),
  ].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

/* ---- The contract ----
 * `min` states the threshold the ROLE requires, not the value that happens to
 * pass today. Lowering one to make a colour fit is the failure this guards. */
const SURFACES = [
  "--color-bg",
  "--color-bg-elevated",
  "--color-surface",
  "--color-surface-sunken",
  /* Hover is a surface text lands on too — secondary and ghost buttons both
     put their label on it. */
  "--color-surface-hover",
];

/* Every plane a focus ring can be drawn against. The ring is two colours and
   the pair passes when EITHER clears 3:1, so this list is checked separately
   from the text pairs below. */
const FOCUS_GROUNDS = [
  ...SURFACES,
  "--color-shell",
  "--color-accent",
  "--color-fill",
];

const PAIRS = [
  ...[
    "--color-ink",
    "--color-ink-dim",
    "--color-ink-faint",
    "--color-accent-soft",
  ].flatMap((fg) =>
    SURFACES.map((bg) => ({ fg, bg, min: 4.5, why: "body text" })),
  ),
  ...[
    "--color-success",
    "--color-warning",
    "--color-danger",
    "--color-info",
  ].map((fg) => ({
    fg,
    bg: "--color-bg",
    min: 4.5,
    why: "status text",
  })),
  {
    fg: "--color-on-fill",
    bg: "--color-fill",
    min: 4.5,
    why: "label on the neutral fill",
  },
  {
    fg: "--color-on-accent",
    bg: "--color-accent",
    min: 4.5,
    why: "label on the accent fill",
  },
  {
    fg: "--color-on-shell",
    bg: "--color-shell",
    min: 4.5,
    why: "text on the shell",
  },
  {
    fg: "--color-accent",
    bg: "--color-shell",
    min: 4.5,
    why: "accent as text on the shell",
  },
  /* The danger button puts its own text on its own tinted plane; one nudge to
     the 12% mix breaks it, and no other pair covers it. */
  {
    fg: "--color-danger",
    bg: "--color-danger-surface",
    min: 4.5,
    why: "danger label on the danger plane",
  },
  /* 1.4.11: on an unchecked control the border is the only thing announcing
     that a control exists, so it is held to 3:1 on every surface it can sit on. */
  ...SURFACES.map((bg) => ({
    fg: "--color-control-border",
    bg,
    min: 3,
    why: "control border",
  })),
];

const errors = [];
const rows = [];

for (const [themeName, tokens] of [
  ["light", light],
  ["dark", dark],
]) {
  for (const { fg, bg, min, why } of PAIRS) {
    let ratio;
    try {
      ratio = contrast(tokens[fg], tokens[bg], tokens);
    } catch (cause) {
      errors.push(
        `${themeName}: cannot measure ${fg} on ${bg} — ${cause.message}`,
      );
      continue;
    }
    const ok = ratio >= min;
    rows.push(
      `  ${ok ? "ok" : "NG"}  ${themeName.padEnd(5)} ${fg} on ${bg}  ${ratio.toFixed(2)}:1 (needs ${min})`,
    );
    if (!ok) {
      errors.push(
        `${themeName}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, below the ${min}:1 required for ${why}.`,
      );
    }
  }

  /* ---- The focus ring ----
   * Scored as a pair, not per colour: the indicator is a light inner ring
   * inside a dark outer one, so it is legible wherever EITHER clears 3:1. No
   * single colour can span paper to shell, which is why the earlier one-colour
   * ring measured 2.50:1 on the shell while its own comment claimed otherwise. */
  for (const bg of FOCUS_GROUNDS) {
    let inner, outer;
    try {
      inner = contrast(tokens["--color-focus-inner"], tokens[bg], tokens);
      outer = contrast(tokens["--color-focus-outer"], tokens[bg], tokens);
    } catch (cause) {
      errors.push(
        `${themeName}: cannot measure the focus ring on ${bg} — ${cause.message}`,
      );
      continue;
    }
    const best = Math.max(inner, outer);
    const ok = best >= 3;
    rows.push(
      `  ${ok ? "ok" : "NG"}  ${themeName.padEnd(5)} focus ring on ${bg}  inner ${inner.toFixed(2)} / outer ${outer.toFixed(2)} → ${best.toFixed(2)}:1 (needs 3)`,
    );
    if (!ok) {
      errors.push(
        `${themeName}: neither focus ring clears 3:1 on ${bg} (best ${best.toFixed(2)}:1). ` +
          `A focus indicator invisible on a surface the system renders fails WCAG 1.4.11.`,
      );
    }
  }
}

console.log(rows.join("\n"));

if (blockErrors.length > 0) {
  console.error("\ncheck:contrast failed — the two dark blocks have drifted\n");
  for (const e of blockErrors) console.error(`  - ${e}`);
  console.error(
    '\nThe `[data-theme="dark"]` block and the `prefers-color-scheme` block must stay\n' +
      "identical; otherwise dark differs by how it was switched on.",
  );
  process.exit(1);
}

if (errors.length > 0) {
  console.error("\ncheck:contrast failed\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nRaise the colour rather than the threshold: the minimums encode WCAG, not preference.",
  );
  process.exit(1);
}
console.log("\ncheck:contrast ok");
