#!/usr/bin/env node
/* Verifies the `"use client"` boundaries a React Server Component consumer
 * depends on.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * A server build of React has no `createContext` and no hooks, and a function
 * cannot cross into a client component as a prop. A module that does either
 * without a client boundary throws when a server component imports the package,
 * and every other check stays green: type-check, build and the stories all run
 * in a client environment.
 *
 * Boundaries are per source file (`unbundle` in `tsdown.config.ts`), so the
 * static components stay renderable on the server — `<Icon icon={Check} />`
 * from a server component only works while `Icon` is not a client module.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 *   1. A source module needs `"use client"` exactly when it calls a React hook,
 *      `createContext` or `use`, or passes an inline function (or a `render`
 *      that is not an element) into JSX. Missing it, or carrying it without
 *      the need, fails.
 *   2. Every built module in `dist/` carries the directive exactly when its
 *      source does, so the build kept what the source declared. A module of
 *      type declarations only has no built module and is skipped.
 *
 * ── What it deliberately does not check ────────────────────────────────
 * A function reaching a prop through a variable, a call or a spread (only a
 * function written inside a JSX expression, outside any call, and a
 * non-element `render` are seen); the rule above is a floor, and a new kind
 * of server-hostile code needs the predicate extended.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const errors = [];

const parse = (file) =>
  ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : undefined,
  );

const hasClientDirective = (source) => {
  for (const statement of source.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    ) {
      return false;
    }
    if (statement.expression.text === "use client") return true;
  }
  return false;
};

const isHookName = (name) =>
  name === "use" || name === "createContext" || /^use[A-Z]/.test(name);

const isJsxValue = (node) =>
  ts.isJsxElement(node) ||
  ts.isJsxSelfClosingElement(node) ||
  ts.isJsxFragment(node);

const isTypeOnlyModule = (source) =>
  source.statements.every(
    (statement) =>
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      (ts.isImportDeclaration(statement) &&
        statement.importClause?.isTypeOnly) ||
      (ts.isExportDeclaration(statement) && statement.isTypeOnly),
  );

const isFunctionValue = (node) =>
  ts.isArrowFunction(node) ||
  ts.isFunctionExpression(node) ||
  ts.isMethodDeclaration(node);

/* A callback handed to a call (`items.map(...)`) runs on the server; any other
   function written inside a JSX expression is a value handed to the element. */
const isJsxValueFunction = (fn) => {
  for (let node = fn.parent; node; node = node.parent) {
    if (ts.isJsxExpression(node)) return true;
    if (
      ts.isCallExpression(node) ||
      ts.isNewExpression(node) ||
      ts.isFunctionLike(node)
    ) {
      return false;
    }
  }
  return false;
};

const clientReasons = (source) => {
  const reasons = new Set();
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name
        : node.expression;
      if (ts.isIdentifier(callee) && isHookName(callee.text)) {
        reasons.add(`calls \`${callee.text}\``);
      }
    }
    if (isFunctionValue(node) && isJsxValueFunction(node)) {
      reasons.add("passes a function to a JSX element");
    }
    if (ts.isJsxAttribute(node) && node.name.getText() === "render") {
      const value =
        node.initializer && ts.isJsxExpression(node.initializer)
          ? node.initializer.expression
          : undefined;
      if (value && !isJsxValue(value) && !isFunctionValue(value)) {
        reasons.add("passes a `render` prop that is not an element");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return [...reasons];
};

const sources = readdirSync(SRC, { recursive: true })
  .filter((relative) => /\.tsx?$/.test(relative))
  .sort();

for (const relative of sources) {
  const sourceFile = join(SRC, relative);
  const source = parse(sourceFile);
  const marked = hasClientDirective(source);
  const reasons = clientReasons(source);
  const needed = reasons.length > 0;

  if (needed && !marked) {
    errors.push(
      `src/${relative} ${reasons.join(" and ")} but has no \`"use client"\`.\n` +
        `  A server component importing the package would fail to build; add the directive.`,
    );
  } else if (marked && !needed) {
    errors.push(
      `src/${relative} has \`"use client"\` but nothing in it needs a client boundary.\n` +
        `  It would make the component unusable with server-only props (\`Icon\`'s glyph, say); remove the directive,\n` +
        `  or, if the module needs one for a reason this script cannot see, teach \`clientReasons\` that reason.`,
    );
  }

  if (isTypeOnlyModule(source)) continue;

  const built = relative.replace(/\.tsx?$/, ".mjs");
  const builtFile = join(DIST, built);
  if (!existsSync(builtFile)) {
    errors.push(
      `dist/${built} does not exist.\n` +
        `  Run \`pnpm run build\` first; if it was built, nothing in \`src/index.ts\` imports the module at runtime, or \`unbundle\` stopped emitting a module per source file.`,
    );
  } else if (hasClientDirective(parse(builtFile)) !== marked) {
    errors.push(
      `dist/${built} ${marked ? "lost" : "gained"} \`"use client"\` that src/${relative} ${marked ? "declares" : "does not declare"}.`,
    );
  }
}

if (errors.length > 0) {
  console.error("check:rsc failed\n");
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log(
  `check:rsc ok — ${sources.length} module(s), client boundaries match between src and dist`,
);
