#!/usr/bin/env node
/* Proves the accessibility suite can still fail.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * `pnpm test` reporting "13 passed" is only evidence if axe is wired in. It
 * once was not: calling `setProjectAnnotations` opted the run out of the
 * addon's automatic injection, so `parameters.a11y.test = "error"` configured
 * a check that had never been registered. Every story passed, an `<img>` with
 * no alt text passed, and the green suite was quoted as proof of a11y coverage
 * in the README and in review.
 *
 * No assertion inside the suite can detect this — a suite that runs no checks
 * passes every assertion it contains. The only proof is from outside: seed a
 * violation, and require the suite to go red.
 *
 * ── What it does ───────────────────────────────────────────────────────
 * Writes a story containing an unambiguous axe violation (`image-alt`), runs
 * the suite, and fails if that run SUCCEEDS. The story is removed afterwards
 * whatever happens.
 *
 * ── Cost ───────────────────────────────────────────────────────────────
 * One extra browser run, so it belongs to `verify:full` rather than `verify`.
 */

import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROBE = join(ROOT, "stories", "__axe-live-probe.stories.tsx");

const STORY = `import type { Meta, StoryObj } from "@storybook/react-vite";

// Written by scripts/check-axe-live.mjs. Deleted again by the same script.
const meta = { title: "Internal/Axe probe" } satisfies Meta;
export default meta;

export const SeededViolation: StoryObj<typeof meta> = {
  render: () => (
    // eslint-disable-next-line jsx-a11y/alt-text -- the missing alt IS the probe.
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width={1} height={1} />
  ),
};
`;

writeFileSync(PROBE, STORY);

let suitePassed;
let output;
try {
  output = execFileSync(
    "pnpm",
    ["exec", "vitest", "run", "--project=storybook"],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  suitePassed = true;
} catch (failure) {
  output = `${failure.stdout ?? ""}${failure.stderr ?? ""}`;
  suitePassed = false;
} finally {
  rmSync(PROBE, { force: true });
}

if (suitePassed) {
  console.error(
    "check:axe-live failed\n\n" +
      "  - a story with a missing `alt` attribute did NOT fail the suite, so axe is not\n" +
      "    running. Every green `pnpm test` result is currently meaningless.\n" +
      "    Check that `.storybook/vitest.setup.ts` passes the addon-a11y annotations to\n" +
      "    `setProjectAnnotations` — calling it at all disables the addon's own injection.\n",
  );
  process.exit(1);
}

/* Red is necessary but not sufficient: a setup error also fails the run, and
   would leave axe just as absent. Require the failure to name the seeded rule. */
if (!output.includes("image-alt")) {
  console.error(
    "check:axe-live failed\n\n" +
      "  - the suite failed, but not on the seeded `image-alt` violation, so this proves\n" +
      "    nothing about axe. The run probably broke before reaching the stories:\n\n" +
      `${output.split("\n").slice(-25).join("\n")}\n`,
  );
  process.exit(1);
}

console.log(
  "check:axe-live ok — a seeded violation fails the suite, so axe is live",
);
