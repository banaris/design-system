/* Namespace import: the module exports `decorators` / `afterEach` /
   `parameters` individually and has no default. */
import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";

import preview from "./preview";

/* Applies the annotations stories need when Vitest renders them.
 *
 * ⚠ BOTH entries are load-bearing, and each was proved by a seeded failure.
 * Dropping `preview` loses the theme decorator: `data-theme` never lands, every
 * token falls back, and four stories fail on contrast. Dropping the a11y
 * annotations loses axe itself — and that one fails SILENTLY. Calling
 * `setProjectAnnotations` at all opts out of the addon's automatic injection,
 * so `parameters.a11y.test` in `preview.tsx` sits there configuring a check
 * that never runs: an `<img>` with no alt passed the suite 14/14.
 *
 * If either import is removed, re-seed a violation and confirm the suite goes
 * red before believing it. */
setProjectAnnotations([a11yAnnotations, preview]);
