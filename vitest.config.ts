import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import type { BrowserCommand } from "vitest/node";

/* Synthetic touch events from `userEvent.pointer` carry no active pointer, so
 * Base UI's `setPointerCapture` throws; these send real touches instead. */
const tap: BrowserCommand<[selector: string, x: number, y: number]> = (
  { iframe },
  selector,
  x,
  y,
) => iframe.locator(selector).tap({ position: { x, y } });

/* Real touch drag from `(x, y)` inside `selector` by `(dx, dy)`, sent over CDP
 * because Playwright has no swipe; the box is in the top frame's coordinates. */
const swipe: BrowserCommand<
  [selector: string, x: number, y: number, dx: number, dy: number]
> = async ({ context, iframe, page }, selector, x, y, dx, dy) => {
  const box = await iframe.locator(selector).boundingBox();
  if (!box) throw new Error(`swipe target not found: ${selector}`);
  const cdp = await context.newCDPSession(page);
  const touch = (
    type: "touchStart" | "touchMove" | "touchEnd",
    fx: number,
    fy: number,
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x: fx, y: fy }],
    });
  const steps = 10;
  await touch("touchStart", box.x + x, box.y + y);
  for (let i = 1; i <= steps; i += 1) {
    await touch(
      "touchMove",
      box.x + x + (dx * i) / steps,
      box.y + y + (dy * i) / steps,
    );
  }
  await touch("touchEnd", 0, 0);
  await cdp.detach();
};

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
    contextOptions?: {
      reducedMotion?: "reduce";
      hasTouch?: boolean;
      isMobile?: boolean;
    };
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
        commands: { tap, swipe },
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
      storybookProject("storybook", {
        setupFiles: [".storybook/vitest.fine-pointer.setup.ts"],
      }),
      storybookProject("storybook-reduced-motion", {
        tags: { include: ["reduced-motion"] },
        contextOptions: { reducedMotion: "reduce" },
        setupFiles: [
          ".storybook/vitest.reduced-motion.setup.ts",
          ".storybook/vitest.fine-pointer.setup.ts",
        ],
      }),
      storybookProject("storybook-coarse", {
        contextOptions: { hasTouch: true, isMobile: true },
        setupFiles: [".storybook/vitest.coarse.setup.ts"],
      }),
      /* WCAG 2.2 1.4.10 Reflow: every story at 320px, asserted by `narrowViewport`. */
      storybookProject("storybook-narrow", {
        setupFiles: [
          ".storybook/vitest.narrow.setup.ts",
          ".storybook/vitest.fine-pointer.setup.ts",
        ],
      }),
    ],
  },
});
