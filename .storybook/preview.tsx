import "./preview.css";

import type { Decorator, Preview } from "@storybook/react-vite";

/* The catalogue renders on the page's own background, so the theme has to be
 * applied to `documentElement` rather than to a wrapper: the tokens are
 * declared on `:root` and the dark overlay keys off `[data-theme]` there. */
const withTheme: Decorator = (Story, context) => {
  document.documentElement.setAttribute(
    "data-theme",
    context.globals["theme"] === "dark" ? "dark" : "light",
  );
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    /* `error` is what makes the axe run a CI gate rather than an advisory —
       at any lower level a violation still reports but the suite stays green.
       Silence a genuine false positive in the individual story's parameters,
       never here. */
    a11y: { test: "error" },
  },
};

export default preview;
