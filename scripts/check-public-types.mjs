#!/usr/bin/env node
/* Compares the package's resolved public type surface with a committed
 * snapshot, `api/public-types.txt`.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * Most public prop types are derived from Base UI's (`ComponentProps<typeof
 * BaseX>`), and `@base-ui/react` is a caret dependency. A Base UI minor that
 * adds, renames or retypes a prop changes this package's API with no release
 * or changeset here. The built `dist/**\/*.d.mts` keeps
 * `ComponentProps<typeof BaseX>` unexpanded, so its text does not move when
 * Base UI does; the snapshot is therefore the type checker's resolved form.
 *
 * When this repo's lockfile moves to a Base UI that changes the surface (a
 * Renovate PR), the check fails and the maintainer records it with a
 * changeset. An intended change to this package's own types shows up as a
 * reviewable diff of the snapshot.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 *   Every export of the file at `exports["."].types`, resolved with the
 *   TypeScript compiler API, one line each: a props type lists its properties
 *   (name, optionality, resolved type), a component also the properties of its
 *   props parameter, anything else its resolved type. The result must equal
 *   `api/public-types.txt`; `--update` rewrites that file.
 *
 * ── What it does not catch ─────────────────────────────────────────────
 *   - A consumer's install resolving a newer Base UI inside the range before
 *     this repo has moved to it: the record lands after the drift, and two
 *     consumers of one version of this package can still see different types.
 *     Only an exact pin or a peer dependency would close that.
 *   - A lowest-versions run: only the version in the lockfile is measured, so
 *     a consumer on an older Base UI inside the range is not exercised.
 *   - Properties declared only in `@types/react` or TypeScript's lib are left
 *     out (hundreds of DOM attributes per component, and they move with every
 *     `@types/react` release). A property of theirs that this package starts
 *     or stops omitting is therefore not seen.
 *   - Behaviour: a prop that keeps its type but changes what it does.
 *   - A type the checker prints by name (a callback's `state` argument, a
 *     hook's return type) is recorded by that name; a change inside it is not
 *     seen. `@types/react` aliases such as `ReactNode` stay by name on purpose.
 *   - A TypeScript release that changes how types are printed moves the
 *     snapshot with no API change: run `--update`, no changeset needed.
 *   - A union-typed export is recorded as its resolved type, not per member.
 *
 * Run `pnpm run build` first; this reads `dist/`.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "api", "public-types.txt");
const update = process.argv.includes("--update");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const entryRel = pkg.exports?.["."]?.types;
if (typeof entryRel !== "string") {
  console.error(
    'check:public-types failed\n\n  package.json has no exports["."].types',
  );
  process.exit(1);
}
const entry = join(ROOT, entryRel);
if (!existsSync(entry)) {
  console.error(
    `check:public-types failed\n\n  ${entryRel} does not exist — run \`pnpm run build\` first.`,
  );
  process.exit(1);
}

const program = ts.createProgram([entry], {
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noEmit: true,
  types: [],
});
const checker = program.getTypeChecker();
const errors = [];

/* An unresolved import turns its types into `any` and would record a hollow
   surface; only dist's own diagnostics are read, never a library's. */
const distRoot = dirname(entry);
for (const file of program.getSourceFiles()) {
  if (!file.fileName.startsWith(`${distRoot}/`)) continue;
  for (const d of program.getSemanticDiagnostics(file)) {
    errors.push(
      `${relative(ROOT, file.fileName)}: ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`,
    );
  }
}

const rootFile = program.getSourceFile(entry);
const moduleSymbol = rootFile && checker.getSymbolAtLocation(rootFile);
if (!moduleSymbol) {
  errors.push(`${entryRel} has no exports to read`);
}

/* Printed paths are absolute and carry pnpm's version and hash; reduce them to
   the import path so the snapshot is machine-independent and a bump moves types only. */
const normalisePath = (path) => {
  const modules = path.lastIndexOf("/node_modules/");
  if (modules !== -1) return path.slice(modules + "/node_modules/".length);
  if (path.startsWith(`${ROOT}/`)) return path.slice(ROOT.length + 1);
  return path;
};
const print = (type, expandAlias = false) =>
  checker
    .typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation |
        (expandAlias ? ts.TypeFormatFlags.InTypeAlias : 0),
    )
    .replace(
      /import\("([^"]+)"\)/g,
      (_, path) => `import("${normalisePath(path)}")`,
    );

const isReactOrTsLibDeclaration = (declaration) =>
  /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:@types\/react|typescript)\//.test(
    declaration.getSourceFile().fileName,
  );

const propertyLines = (label, type) =>
  checker
    .getPropertiesOfType(type)
    .filter((p) => !p.declarations?.every(isReactOrTsLibDeclaration))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => {
      const optional = p.flags & ts.SymbolFlags.Optional ? "?" : "";
      return `${label}.${p.name}${optional}: ${print(checker.getTypeOfSymbol(p))}`;
    });

const lines = [];
const exportsOfModule = (
  moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []
).sort((a, b) => a.name.localeCompare(b.name));
const exportedNames = new Set(exportsOfModule.map((e) => e.name));
for (const exported of exportsOfModule) {
  const symbol =
    exported.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exported)
      : exported;
  if (symbol.flags & ts.SymbolFlags.Value) {
    const valueType = checker.getTypeOfSymbol(symbol);
    lines.push(`${exported.name}: ${print(valueType)}`);
    const parameter = valueType.getCallSignatures()[0]?.parameters[0];
    const props =
      parameter && checker.getTypeOfSymbolAtLocation(parameter, rootFile);
    if (props && !exportedNames.has(props.aliasSymbol?.name)) {
      lines.push(...propertyLines(`${exported.name}(props)`, props));
    }
    continue;
  }
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  if (type.flags & ts.TypeFlags.Any) {
    errors.push(`${exported.name} resolves to \`any\``);
  }
  if (!(type.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection))) {
    lines.push(`${exported.name} = ${print(type, true)}`);
    continue;
  }
  const own = propertyLines(exported.name, type);
  lines.push(
    ...(own.length > 0 ? own : [`${exported.name}: no own properties`]),
  );
}

if (errors.length > 0) {
  console.error("check:public-types failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}

const report = `${[
  "# The package's resolved public type surface. Generated by `pnpm run check:public-types --update`; do not edit by hand.",
  ...lines,
].join("\n")}\n`;

if (update) {
  writeFileSync(SNAPSHOT, report);
  console.log(`check:public-types: wrote ${relative(ROOT, SNAPSHOT)}`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  console.error(
    `check:public-types failed\n\n  ${relative(ROOT, SNAPSHOT)} does not exist — run \`pnpm run check:public-types --update\` and commit it.`,
  );
  process.exit(1);
}

const expected = readFileSync(SNAPSHOT, "utf8");
if (expected !== report) {
  const before = new Set(expected.split("\n"));
  const after = new Set(report.split("\n"));
  const SHOWN = 40;
  const removed = [...before].filter((l) => !after.has(l));
  const added = [...after].filter((l) => !before.has(l));
  console.error("check:public-types failed\n");
  console.error(
    "  The public type surface differs from api/public-types.txt.\n" +
      "  If the change is intended, run `pnpm run check:public-types --update`\n" +
      "  and commit the snapshot. Add a changeset when the change comes from this\n" +
      "  package's own types or a runtime dependency such as @base-ui/react; a\n" +
      "  typescript or @types/react bump alone needs none.\n",
  );
  const shown = [
    ...removed.slice(0, SHOWN).map((l) => `  - ${l}`),
    ...added.slice(0, SHOWN).map((l) => `  + ${l}`),
  ];
  for (const l of shown) console.error(l);
  const more = removed.length + added.length - shown.length;
  if (more > 0) console.error(`  … and ${more} more changed lines`);
  process.exit(1);
}
console.log("check:public-types ok");
