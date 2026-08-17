#!/usr/bin/env node
/* Asserts the brand mark's hexagons actually tile without overlapping.
 *
 * ── What this catches ──────────────────────────────────────────────────
 * `LogoMark` positions seven hexagons from two angle conventions that must
 * agree: `hexPoints` decides which way a tile is turned, and `RING` decides
 * where its neighbours sit. A pointy-top tile's neighbours lie across its flat
 * sides, 30° off its vertices — and picking the vertex directions instead is
 * both the plausible-looking choice and wrong.
 *
 * Nothing else notices. The SVG is valid, the build passes, axe passes (the
 * mark is `aria-hidden` in most stories), and the render still reads as a
 * hexagon cluster — just with darker blotches where the translucent tiles
 * double up. It shipped that way in the first draft, under a comment warning
 * against exactly this mistake, which is why the check is mechanical now.
 *
 * ── What it checks ─────────────────────────────────────────────────────
 * Every pair of tiles is disjoint, by separating-axis test on the real
 * coordinates the component computes.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(
  join(ROOT, "src", "components", "logo-mark.tsx"),
  "utf8",
);

/* Read the constants from the component rather than restating them; a copy
   here would let the two drift and the check would pass on stale numbers. */
const num = (name) => {
  const m = new RegExp(`const ${name} = ([\\d.]+);`).exec(source);
  if (m === null) throw new Error(`cannot read ${name} from logo-mark.tsx`);
  return Number(m[1]);
};
const R = num("R");
const GAP = num("GAP");

/* Both angle expressions are evaluated from the component's own source, so the
   check measures whatever it currently computes. Hard-coding them here would
   only ever re-assert this script's copy — the drift between the two
   conventions is precisely what has to be caught. */
const angleFn = (label, pattern) => {
  const m = pattern.exec(source);
  if (m === null) {
    console.error(
      `check:geometry failed\n\n  - cannot find the ${label} angle expression in logo-mark.tsx.\n` +
        `    The tiling maths moved; re-derive it and update this script rather than skipping it.\n`,
    );
    process.exit(1);
  }
  const expr = m[1];
  if (!/^[\d\s+\-*/k().]+$/.test(expr)) {
    console.error(
      `check:geometry failed\n\n  - the ${label} angle expression is not plain arithmetic: ${expr}\n`,
    );
    process.exit(1);
  }
  return new Function("k", `return (${expr});`);
};

/* Anchored on the enclosing declaration, not on the shape of the expression:
   prettier rewrites redundant parentheses, and a pattern keyed on those matched
   the wrong one of the two `const angle = …` lines — which made this guard
   report the tiles as overlapping when they do not. */
const ringDeg = angleFn(
  "ring",
  /const RING = [\s\S]*?const angle = \(([^;]*?) \* Math\.PI\) \/ 180;/,
);
const vertexDeg = angleFn(
  "vertex",
  /const hexPoints = [\s\S]*?const angle = \(([^;]*?) \* Math\.PI\) \/ 180;/,
);

const STEP = Math.sqrt(3) * R + GAP;
const verts = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (vertexDeg(k) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

const centres = [
  { name: "centre", x: 48, y: 48 },
  ...Array.from({ length: 6 }, (_, k) => {
    const a = (ringDeg(k) * Math.PI) / 180;
    return {
      name: `ring[${k}]`,
      x: 48 + STEP * Math.cos(a),
      y: 48 + STEP * Math.sin(a),
    };
  }),
];

/* Two convex polygons are disjoint iff some edge normal separates them, so the
   widest gap across all axes is the real clearance — negative means overlap. */
const clearance = (A, B) => {
  let widest = -Infinity;
  for (const poly of [A, B]) {
    for (let i = 0; i < poly.length; i += 1) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const nx = -(y2 - y1) / len;
      const ny = (x2 - x1) / len;
      const project = (p) => p.map(([x, y]) => x * nx + y * ny);
      const a = project(A);
      const b = project(B);
      widest = Math.max(
        widest,
        Math.max(
          Math.min(...a) - Math.max(...b),
          Math.min(...b) - Math.max(...a),
        ),
      );
    }
  }
  return widest;
};

const tiles = centres.map((c) => ({ ...c, poly: verts(c.x, c.y, R) }));
const errors = [];
const rows = [];

for (let i = 0; i < tiles.length; i += 1) {
  for (let j = i + 1; j < tiles.length; j += 1) {
    const gap = clearance(tiles[i].poly, tiles[j].poly);
    /* Only adjacent pairs are interesting; distant ones trivially clear. */
    if (gap > GAP * 2) continue;
    const ok = gap >= 0;
    rows.push(
      `  ${ok ? "ok" : "NG"}  ${tiles[i].name} ↔ ${tiles[j].name}  ${gap >= 0 ? `gap ${gap.toFixed(2)}` : `OVERLAP ${(-gap).toFixed(2)}`}`,
    );
    if (!ok) {
      errors.push(
        `${tiles[i].name} and ${tiles[j].name} interpenetrate by ${(-gap).toFixed(2)} units.\n` +
          `      Translucent tiles double their alpha where they overlap, so this renders as\n` +
          `      a dark blotch rather than the intended seam. Check the ring angle against\n` +
          `      hexPoints' orientation: a pointy-top tile's neighbours sit at 0° + k·60°.`,
      );
    }
  }
}

console.log(rows.join("\n"));

if (errors.length > 0) {
  console.error("\ncheck:geometry failed\n");
  for (const e of errors) console.error(`  - ${e}\n`);
  process.exit(1);
}
console.log(`\ncheck:geometry ok — 7 tiles, every adjacent pair clears ${GAP}`);
