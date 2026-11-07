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

export const Default: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByText("Page content"));
    await expect(style.maxWidth).toBe("1280px");
    await expect(style.paddingLeft).toBe("16px");
    await expect(style.paddingRight).toBe("16px");
  },
};

export const GutterOverride: Story = {
  args: { className: "px-0" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByText("Page content"));
    await expect(style.paddingLeft).toBe("0px");
  },
};

export const Narrow: Story = {
  args: { size: "narrow" },
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByText("Page content"));
    await expect(style.maxWidth).toBe("768px");
  },
};
