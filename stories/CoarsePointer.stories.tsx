import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

/* `check:styles` compiles this story and requires `coarse:h-11` inside the media block. */
const meta = {
  title: "Foundations/Coarse pointer",
  render: () => <div className="bg-surface coarse:h-11 h-4">Probe</div>,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Probe: Story = {
  play: async ({ canvas }) => {
    const coarse = matchMedia("(any-pointer: coarse)").matches;
    await expect(getComputedStyle(canvas.getByText("Probe")).height).toBe(
      coarse ? "44px" : "16px",
    );
  },
};
