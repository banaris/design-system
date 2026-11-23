/* A small CSS reader and cascade resolver, for checks that must know which
 * declaration wins rather than only where it sits. Used on the built
 * `dist/styles.css` and on the output of a throwaway consumer build.
 *
 * It fails closed: input it cannot rank (a conditional `:root` declaration,
 * `!important`, a layer nested three deep) throws instead of guessing.
 */

/**
 * Flat, source-ordered view of a stylesheet: every block that holds
 * declarations, with the `@layer` path and at-rules around it, plus the order
 * in which layer paths first appear. Comments are dropped; unbalanced braces
 * throw, so a caller never reads a half-parsed file.
 */
export const parseCssBlocks = (css) => {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const appearances = [];
  let i = 0;

  const note = (path) => {
    if (!appearances.includes(path)) appearances.push(path);
  };

  const path = (layers, name) => [...layers, ...name.trim().split(".")];

  const body = (layers, atRules, selector) => {
    const decls = [];
    let prelude = "";
    const declare = () => {
      const raw = prelude.trim();
      prelude = "";
      const colon = raw.indexOf(":");
      if (raw !== "" && !raw.startsWith("@") && colon !== -1)
        decls.push([raw.slice(0, colon).trim(), raw.slice(colon + 1).trim()]);
    };
    while (i < text.length) {
      const ch = text[i++];
      if (ch === "{") {
        const head = prelude.trim();
        prelude = "";
        if (/^@layer\b/.test(head)) {
          const named = path(layers, head.slice("@layer".length));
          note(named.join("."));
          body(named, atRules, selector);
        } else if (head.startsWith("@")) {
          body(layers, [...atRules, head], selector);
        } else {
          body(
            layers,
            atRules,
            selector === null ? head : `${selector} ${head}`,
          );
        }
      } else if (ch === ";") {
        const layerStatement = /^@layer\s+([^{]+)$/.exec(prelude.trim());
        if (layerStatement !== null) {
          for (const name of layerStatement[1].split(","))
            note(path(layers, name).join("."));
          prelude = "";
        } else declare();
      } else if (ch === "}") {
        declare();
        if (decls.length > 0)
          rules.push({
            layers,
            atRules,
            selector: selector ?? atRules.at(-1) ?? "",
            decls,
            index: rules.length,
          });
        return;
      } else prelude += ch;
    }
    if (layers.length > 0 || atRules.length > 0 || selector !== null)
      throw new Error("unbalanced braces");
  };

  body([], [], null);
  return { rules, appearances };
};

const rank = (rule, appearances) => {
  if (rule.layers.length === 0) return [Infinity, Infinity];
  if (rule.layers.length > 2)
    throw new Error(`layer nested too deep to rank: ${rule.layers.join(".")}`);
  const top = [...new Set(appearances.map((p) => p.split(".")[0]))];
  const parent = rule.layers[0];
  const subs = [
    ...new Set(
      appearances
        .filter((p) => p.startsWith(`${parent}.`))
        .map((p) => p.split(".")[1]),
    ),
  ];
  return [
    top.indexOf(parent),
    rule.layers.length === 1 ? Infinity : subs.indexOf(rule.layers[1]),
  ];
};

const targetsRoot = (rule) =>
  rule.selector.split(",").some((s) => [":root", ":host"].includes(s.trim()));

export const effectiveRootValue = (css, property) => {
  const { rules, appearances } = parseCssBlocks(css);
  const declaring = rules.filter(
    (r) => targetsRoot(r) && r.decls.some(([prop]) => prop === property),
  );
  if (declaring.some((r) => r.atRules.length > 0))
    throw new Error(
      `${property} is declared inside an at-rule; the cascade cannot be resolved statically`,
    );
  if (
    declaring.some((r) =>
      r.decls.some(
        ([prop, value]) => prop === property && /!important/i.test(value),
      ),
    )
  )
    throw new Error(
      `${property} is declared !important; the cascade cannot be resolved here`,
    );
  let best;
  for (const rule of declaring) {
    const key = rank(rule, appearances);
    if (
      best === undefined ||
      key[0] > best.key[0] ||
      (key[0] === best.key[0] && key[1] > best.key[1]) ||
      (key[0] === best.key[0] &&
        key[1] === best.key[1] &&
        rule.index > best.rule.index)
    )
      best = { rule, key };
  }
  return best?.rule.decls.findLast(([prop]) => prop === property)?.[1];
};
