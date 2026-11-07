import { Container } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Layout/Container",
  component: Container,
  render: (args) => <Container {...args} />,
  args: { children: "Page content" },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const gutter = () =>
  matchMedia("(min-width: 40rem)").matches ? "24px" : "16px";

export const Default: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByText("Page content"));
    await expect(style.maxWidth).toBe("1280px");
    await expect(style.paddingLeft).toBe(gutter());
    await expect(style.paddingRight).toBe(gutter());
  },
};

export const Narrow: Story = {
  args: { size: "sm" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByText("Page content"));
    await expect(style.maxWidth).toBe("768px");
  },
};
