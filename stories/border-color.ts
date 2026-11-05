import { expect } from "storybook/test";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const resolveToken = (token: string): string => {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
};

export const expectStateBorders = async (borders: {
  resting: HTMLElement;
  invalid: HTMLElement;
  disabled: HTMLElement;
  disabledInvalid: HTMLElement;
}) => {
  const colour = (el: HTMLElement) => getComputedStyle(el).borderTopColor;
  await expect(colour(borders.resting)).toBe(
    resolveToken("--color-control-border"),
  );
  await expect(colour(borders.invalid)).toBe(resolveToken("--color-danger"));
  await expect(colour(borders.disabled)).toBe(TRANSPARENT);
  await expect(colour(borders.disabledInvalid)).toBe(TRANSPARENT);
};
