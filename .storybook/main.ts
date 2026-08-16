import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  /* `addon-a11y` is not only the inspector panel — paired with `addon-vitest`
     it is what runs axe over every story in CI. See `preview.tsx`. */
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableWhatsNewNotifications: true },
  viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        /* Stories import by package name so they read exactly as a consumer's
           code would. `dist` does not exist during development, so the
           self-reference resolves to source instead. */
        alias: {
          "@banaris/design-system": fileURLToPath(
            new URL("../src/index.ts", import.meta.url),
          ),
        },
      },
      plugins: [tailwindcss()],
    });
  },
};

export default config;
