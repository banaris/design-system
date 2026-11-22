import { setProjectAnnotations } from "@storybook/react-vite";

import { REFLOW_VIEWPORT } from "./narrow-viewport";
import { projectAnnotations } from "./project-annotations";

/* Replaces the call in `vitest.setup.ts` (the later one wins), adding the
 * viewport the addon applies to every story before it runs. */
setProjectAnnotations([
  ...projectAnnotations,
  { initialGlobals: { viewport: { value: REFLOW_VIEWPORT } } },
]);
