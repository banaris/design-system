#!/usr/bin/env node
/* Fails when the install steps in README.md and the catalogue's "Getting
 * started" page stop agreeing.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * Both pages tell a consumer how to install and import the package. Each is
 * edited on its own, and nothing else notices when one is changed and the
 * other keeps the old command or import: the build, the types and the linter
 * are all green, and a reader of the stale page copies a step that no longer
 * works.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 * Within the bounded install section of each file:
 *   - the fenced code blocks, in order, language tag and content;
 *   - the set of `@banaris/design-system/<file>.css` entry points named in
 *     inline code (README lists them in a table, the page in a list).
 * A section whose heading is missing, whose fence never closes, or that holds
 * no code block fails rather than passing: an unreadable section would
 * otherwise compare equal to another unreadable one.
 *
 * ── What it deliberately does not check ────────────────────────────────
 * Prose. The page is shorter than the README on purpose.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SECTIONS = [
  { file: "README.md", from: "## Install", to: "## Theming" },
  {
    file: "stories/guides/GettingStarted.mdx",
    from: "## Install",
    to: "## Theming",
  },
];

const FENCE = /^ {0,3}```(.*)$/;

function sectionLines(lines, from, to) {
  let inFence = false;
  let start = -1;
  for (const [i, line] of lines.entries()) {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence && start === -1 && line.trimEnd() === from) start = i;
    else if (!inFence && start !== -1 && line.trimEnd() === to) {
      return lines.slice(start + 1, i);
    }
  }
  throw new Error(
    start === -1
      ? `heading "${from}" not found`
      : `heading "${to}" not found after "${from}"`,
  );
}

function parse(lines) {
  const blocks = [];
  const prose = [];
  let open = null;
  for (const line of lines) {
    const fence = FENCE.exec(line);
    if (open === null) {
      if (fence) open = { lang: fence[1].trim(), body: [] };
      else if (/^[\s>]*(~~~|```)/.test(line)) {
        throw new Error("only plain ``` fences are supported");
      } else prose.push(line);
    } else if (fence && fence[1].trim() === "") {
      blocks.push({ lang: open.lang, body: open.body.join("\n") });
      open = null;
    } else {
      open.body.push(line);
    }
  }
  if (open !== null) throw new Error("a code fence is never closed");
  const entryPoints = new Set(
    prose
      .join("\n")
      .matchAll(/`(@banaris\/design-system\/[\w.-]+\.css)`/g)
      .map((m) => m[1]),
  );
  if (blocks.length === 0) throw new Error("no code block in the section");
  if (entryPoints.size === 0) throw new Error("no entry point in the section");
  return { blocks, entryPoints };
}

const problems = [];
const parsed = [];
for (const { file, from, to } of SECTIONS) {
  try {
    const text = readFileSync(join(ROOT, file), "utf8");
    parsed.push({ file, ...parse(sectionLines(text.split("\n"), from, to)) });
  } catch (error) {
    problems.push(`${file}: ${error.message}`);
  }
}

if (problems.length === 0) {
  const [a, b] = parsed;
  const count = Math.max(a.blocks.length, b.blocks.length);
  for (let i = 0; i < count; i++) {
    const x = a.blocks[i];
    const y = b.blocks[i];
    if (x?.lang === y?.lang && x?.body === y?.body) continue;
    const show = (f, blk) =>
      blk === undefined
        ? `    ${f}: (no block ${i + 1})`
        : `    ${f}: block ${i + 1} [${blk.lang}]\n${blk.body.replace(/^/gm, "      | ")}`;
    problems.push(
      `code block ${i + 1} differs between ${a.file} and ${b.file}\n${show(a.file, x)}\n${show(b.file, y)}`,
    );
  }
  for (const [one, other] of [
    [a, b],
    [b, a],
  ]) {
    for (const name of one.entryPoints) {
      if (!other.entryPoints.has(name)) {
        problems.push(
          `${name} is named in ${one.file} but not in ${other.file}`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error("check:install-sync failed\n");
  for (const p of problems) console.error(`  - ${p}\n`);
  process.exit(1);
}

console.log(
  `check:install-sync ok — ${parsed[0].blocks.length} code block(s) and ${parsed[0].entryPoints.size} entry point(s) agree`,
);
