import { Stack } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  render: (args) => <Stack {...args} />,
  args: {
    children: [<span key="a">First</span>, <span key="b">Second</span>],
  },
} satisfies Meta<typeof Stack>;

const parentOf = (el: HTMLElement): HTMLElement => {
  if (el.parentElement === null) throw new Error("child has no parent");
  return el.parentElement;
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(parentOf(canvas.getByText("First")));
    await expect(style.display).toBe("flex");
    await expect(style.flexDirection).toBe("column");
    await expect(style.rowGap).toBe("16px");
  },
};

export const Horizontal: Story = {
  args: { direction: "horizontal", gap: 2 },
  play: async ({ canvas }) => {
    const style = getComputedStyle(parentOf(canvas.getByText("First")));
    await expect(style.flexDirection).toBe("row");
    await expect(style.columnGap).toBe("8px");
  },
};
