import { expect, waitFor } from "storybook/test";

/* Mimics a phone's notch and home indicator by overriding the `--ds-safe-*`
 * variables that `theme.css` fills from `env(safe-area-inset-*)`. The values are
 * above the 1rem (16px) floor so each one decides its edge. */
const INSETS = { top: 47, right: 24, bottom: 34, left: 44 } as const;

export async function withInsets(run: () => Promise<void>) {
  const root = document.documentElement;
  for (const [side, px] of Object.entries(INSETS))
    root.style.setProperty(`--ds-safe-${side}`, `${String(px)}px`);
  /* Components read the insets on `resize`, which a real rotation fires. */
  window.dispatchEvent(new Event("resize"));
  try {
    await run();
  } finally {
    for (const side of Object.keys(INSETS))
      root.style.removeProperty(`--ds-safe-${side}`);
    window.dispatchEvent(new Event("resize"));
  }
}

function slackInsideInsets(box: DOMRect) {
  return {
    top: box.top - INSETS.top,
    right: window.innerWidth - INSETS.right - box.right,
    bottom: window.innerHeight - INSETS.bottom - box.bottom,
    left: box.left - INSETS.left,
  };
}

export async function expectInsideInsets(popup: HTMLElement) {
  await waitFor(async () => {
    const slack = slackInsideInsets(popup.getBoundingClientRect());
    for (const side of Object.values(slack))
      await expect(side).toBeGreaterThanOrEqual(-0.5);
  });
}
