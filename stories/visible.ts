import { expect, waitFor } from "storybook/test";

/* Overlays enter with an animation that starts at `opacity: 0`, and
 * `toBeVisible` reads that as hidden — so wait for the animation to finish. */
export async function expectVisible(find: () => Promise<HTMLElement>) {
  const element = await find();
  await waitFor(() => expect(element).toBeVisible());
  return element;
}
