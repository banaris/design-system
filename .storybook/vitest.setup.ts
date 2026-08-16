import { setProjectAnnotations } from "@storybook/react-vite";

import preview from "./preview";

/* Applies `preview.tsx`'s annotations — the theme decorator and
 * `a11y: { test: "error" }` — to stories run under Vitest.
 *
 * ⚠ The addon prints a notice offering to do this automatically since 10.3.
 * Taking it up was measured to break the run: without this file the theme
 * decorator never fires, `data-theme` is absent, every token falls back, and
 * four stories fail on colour contrast. Keep the file. */
setProjectAnnotations([preview]);
