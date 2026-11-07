#!/usr/bin/env node
/* Keeps the OS-preference dark overlay in `theme.css` generated from the
 * explicit one, so a dark token is edited in exactly one place.
 *
 * ── Why two blocks exist at all ────────────────────────────────────────
 * Dark has to answer two activations: `[data-theme="dark"]` (explicit opt-in)
 * and `prefers-color-scheme: dark` (the OS). They cannot share a selector — a
 * product that pins `data-theme="light"` must not be overridden by the OS — so
 * the declarations are stated twice in the shipped file.
 *
 * ── Which one is the source ────────────────────────────────────────────
 * `:root[data-theme="dark"]` is hand-edited and is the only definition of the
 * dark token set. The block between the BEGIN/END markers is a copy of its
 * declarations (comments are not copied) and is never edited by hand.
 *
 *   node scripts/sync-dark-theme.mjs           rewrite the generated block
 *   node scripts/sync-dark-theme.mjs --check   exit 1 if it is stale
 *
 * ── Failure policy ─────────────────────────────────────────────────────
 * Anything this script does not understand — a missing or duplicated marker or
 * source block, an empty source block, a nested rule, a line that is not a
 * custom-property declaration — stops it with nothing written. A partial copy
 * of the dark set would ship a theme that differs by how it was switched on.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { format, resolveConfig } from "prettier";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "src", "styles", "theme.css");

const BEGIN =
  '/* BEGIN generated — copy of the :root[data-theme="dark"] declarations; run `pnpm run fix:dark-theme`, never edit by hand */';
const END = "/* END generated */";
const SOURCE_OPEN = ':root[data-theme="dark"] {';

const fail = (message) => {
  console.error(`sync-dark-theme: ${message}`);
  process.exit(1);
};

const occurrences = (text, needle) => text.split(needle).length - 1;

const sourceDeclarations = (css) => {
  if (occurrences(css, `\n${SOURCE_OPEN}`) !== 1)
    fail(`expected exactly one line starting with ${SOURCE_OPEN}`);
  const open = css.indexOf(`\n${SOURCE_OPEN}`) + 1 + SOURCE_OPEN.length;
  const close = css.indexOf("}", open);
  if (close === -1) fail("the source block is never closed");
  const body = css.slice(open, close).replace(/\/\*[\s\S]*?\*\//g, "");
  if (body.includes("{")) fail("the source block contains a nested rule");

  const declaration = /(--[\w-]+)\s*:\s*([^;]+);/g;
  const declarations = [...body.matchAll(declaration)].map(
    ([, name, value]) => `${name}: ${value.trim().replace(/\s+/g, " ")};`,
  );
  if (declarations.length === 0) fail("the source block declares nothing");
  if (body.replace(declaration, "").trim() !== "")
    fail(
      "the source block holds something other than custom-property declarations",
    );
  return declarations;
};

const generatedBlock = (declarations) =>
  [
    BEGIN,
    "@media (prefers-color-scheme: dark) {",
    '  :root:not([data-theme="light"]) {',
    ...declarations.map((d) => `    ${d}`),
    "  }",
    "}",
    END,
  ].join("\n");

const current = readFileSync(THEME, "utf8");
if (occurrences(current, BEGIN) !== 1 || occurrences(current, END) !== 1)
  fail("expected exactly one BEGIN and one END marker");
const begin = current.indexOf(BEGIN);
const end = current.indexOf(END) + END.length;
if (end < begin) fail("the END marker comes before the BEGIN marker");

const replaced =
  current.slice(0, begin) +
  generatedBlock(sourceDeclarations(current)) +
  current.slice(end);

const options = (await resolveConfig(THEME)) ?? {};
const next = await format(replaced, { ...options, filepath: THEME });

if (process.argv.includes("--check")) {
  if (next !== current)
    fail(
      'the generated dark block is out of date with :root[data-theme="dark"].\n' +
        "Run `pnpm run fix:dark-theme` and commit the result.",
    );
  console.log("sync-dark-theme: the generated dark block is up to date");
} else if (next === current) {
  console.log("sync-dark-theme: nothing to change");
} else {
  writeFileSync(THEME, next);
  console.log("sync-dark-theme: rewrote the generated dark block");
}
