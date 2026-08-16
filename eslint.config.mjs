import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url))),
  { ignores: ["storybook-static/"] },
  // Warnings do not fail `eslint .`, so a disable directive that no longer
  // suppresses anything would otherwise survive CI indefinitely.
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      // Includes the React Compiler rules as of v7 — there is no separate
      // compiler plugin to install.
      ...reactHooks.configs["recommended-latest"].rules,
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  // No tsconfig includes JavaScript, so type-aware rules have no program to run
  // against and the parser errors on any file it reaches.
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    extends: [jsxA11y.flatConfigs.strict],
  },
  {
    files: ["stories/**/*.{ts,tsx}"],
    extends: [storybook.configs["flat/recommended"]],
  },
);
