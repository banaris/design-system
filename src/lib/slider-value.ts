const decimalsOf = (n: number) => {
  const [mantissa = "", exponent = "0"] = n.toExponential().split("e");
  return Math.max(0, (mantissa.split(".")[1] ?? "").length - Number(exponent));
};

/** Snaps to the nearest `step` counted from `min`, then keeps the result within `min`/`max`. */
export const clampToStep = (
  raw: number,
  min: number,
  max: number,
  step: number,
) => {
  const clamped = Math.min(max, Math.max(min, raw));
  const snapped = min + Math.round((clamped - min) / step) * step;
  const digits = Math.max(decimalsOf(step), decimalsOf(min));
  return Math.min(max, Math.max(min, Number(snapped.toFixed(digits))));
};

/** The number typed into a field, or `undefined` for empty or non-finite text. */
export const parseTyped = (text: string) => {
  const trimmed = text.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};
