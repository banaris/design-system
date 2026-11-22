import { setProjectAnnotations } from "@storybook/react-vite";

import { REFLOW_VIEWPORT } from "./narrow-viewport";
import { projectAnnotations } from "./project-annotations";

setProjectAnnotations([
  ...projectAnnotations,
  { initialGlobals: { viewport: { value: REFLOW_VIEWPORT } } },
]);
