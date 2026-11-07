import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/* Renders every story in a real browser and runs axe over it (`pnpm test`).
 *
 * Chromium rather than a DOM shim because the rules that matter most here —
 * colour-contrast above all — need real layout and computed styles. A shim
 * silently skips them, which for a design system removes most of the value.
 *
 * ⚠ `storybookTest` has to live inside `test.projects`. Configured at the root
 * instead, setup files are handed to the browser as absolute URLs and every
 * story fails to load its dynamic import. */
function storybookProject(
  name: string,
  options: {
    tags?: { include: string[] };
    contextOptions?: { reducedMotion: "reduce" };
    setupFiles?: string[];
  } = {},
) {
  return {
    extends: true as const,
    plugins: [
      tailwindcss(),
      storybookTest({
        configDir: fileURLToPath(new URL(".storybook", import.meta.url)),
        ...(options.tags && { tags: options.tags }),
      }),
    ],
    resolve: {
      alias: {
        "@banaris/design-system": fileURLToPath(
          new URL("src/index.ts", import.meta.url),
        ),
      },
    },
    test: {
      name,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(
          options.contextOptions && { contextOptions: options.contextOptions },
        ),
        instances: [{ browser: "chromium" as const }],
      },
      setupFiles: [".storybook/vitest.setup.ts", ...(options.setupFiles ?? [])],
    },
  };
}

/* The second project reruns the `reduced-motion` stories with reduced motion
 * requested; its setup file fails the run if the browser ignored that. */
export default defineConfig({
  test: {
    projects: [
      storybookProject("storybook"),
      storybookProject("storybook-reduced-motion", {
        tags: { include: ["reduced-motion"] },
        contextOptions: { reducedMotion: "reduce" },
        setupFiles: [".storybook/vitest.reduced-motion.setup.ts"],
      }),
    ],
  },
});
