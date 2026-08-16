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
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          tailwindcss(),
          storybookTest({
            configDir: fileURLToPath(new URL(".storybook", import.meta.url)),
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
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
