import { Grid } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Layout/Grid",
  component: Grid,
  render: (args) => <Grid {...args} />,
  args: {
    children: [
      <span key="a">One</span>,
      <span key="b">Two</span>,
      <span key="c">Three</span>,
    ],
  },
} satisfies Meta<typeof Grid>;

const parentOf = (el: HTMLElement): HTMLElement => {
  if (el.parentElement === null) throw new Error("child has no parent");
  return el.parentElement;
};

export default meta;
type Story = StoryObj<typeof meta>;

const columnCount = (el: HTMLElement) =>
  getComputedStyle(el).gridTemplateColumns.split(" ").length;

export const SingleColumn: Story = {
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(getComputedStyle(grid).display).toBe("grid");
    await expect(columnCount(grid)).toBe(1);
    await expect(getComputedStyle(grid).rowGap).toBe("16px");
  },
};

export const ThreeColumns: Story = {
  args: { columns: 3, gap: 6 },
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(columnCount(grid)).toBe(3);
    await expect(getComputedStyle(grid).columnGap).toBe("24px");
  },
};
