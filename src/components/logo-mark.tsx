import type { SVGProps } from "react";

import { cn } from "../lib/cn";

export type LogoMarkProps = {
  size?: number;
  /** Accessible name. Omit for a mark that sits beside the wordmark, where
   *  announcing it twice would be noise. */
  title?: string;
} & Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox">;

/* The carapace of a クサガメ is tiled in hexagons, and the mark is that tiling
 * reduced to its smallest honest unit: one central scute ringed by six.
 *
 * `hexPoints` puts a vertex straight up (angle −90°), so these are POINTY-TOP
 * hexagons, and a pointy-top tile's neighbours lie across its flat sides — at
 * 0° + k·60°, which is 30° off its vertex directions. Placing the ring on the
 * vertex directions instead is the mistake that looks plausible and renders
 * wrong: measured, the tiles then interpenetrate by 1.19 units and the 0.28
 * alpha doubles to a dark blotch at every corner. `scripts/check-geometry.mjs`
 * asserts the separation so the two angle conventions cannot drift apart. */
const R = 9.4;
const GAP = 1.15;
/* Centre-to-centre spacing. √3·R is twice the inradius — the distance at which
   flat sides touch exactly — so adding GAP is what opens the seam. */
const STEP = Math.sqrt(3) * R + GAP;
const RING = Array.from({ length: 6 }, (_, k) => {
  const angle = (k * 60 * Math.PI) / 180;
  return { x: 48 + STEP * Math.cos(angle), y: 48 + STEP * Math.sin(angle) };
});

const hexPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const angle = ((60 * k - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

/**
 * The Banaris mark: a hexagonal scute cluster.
 *
 * Both colours come from `currentColor` and the accent token, so the mark
 * inherits its surroundings — place it on the shell and it reads inverted with
 * no extra props.
 */
export function LogoMark({
  size = 32,
  title,
  className,
  ...rest
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title === undefined ? "presentation" : "img"}
      aria-hidden={title === undefined ? true : undefined}
      className={cn("shrink-0", className)}
      {...rest}
    >
      {title !== undefined && <title>{title}</title>}
      {RING.map((c) => (
        <polygon
          key={`${c.x.toFixed(2)}:${c.y.toFixed(2)}`}
          points={hexPoints(c.x, c.y, R)}
          fill="currentColor"
          /* The ring reads as the shell's ground, so it stays a shade back and
             lets the accent centre carry the eye. */
          opacity={0.28}
        />
      ))}
      {/* Same R as the ring: the centre is the accent because of its colour
          and full opacity, not because it is bigger. Enlarging it eats the
          seam — at R × 1.32 it interpenetrated its neighbours by 1.46 units. */}
      <polygon points={hexPoints(48, 48, R)} fill="var(--color-accent)" />
    </svg>
  );
}
