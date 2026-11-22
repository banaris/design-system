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

const breakpointSm = () => {
  const sm = getComputedStyle(document.documentElement)
    .getPropertyValue("--breakpoint-sm")
    .trim();
  if (sm === "") throw new Error("--breakpoint-sm is not declared");
  return sm;
};

const expectedColumns = (columns: number) =>
  matchMedia(`(min-width: ${breakpointSm()})`).matches ? columns : 1;

/* Storybook viewports are literal pixels; the play asserts 640px is still `sm`. */
const SM_PX = 640;
const atWidth = (px: number) => ({
  globals: { viewport: { value: `w${String(px)}` } },
  parameters: {
    viewport: {
      options: {
        [`w${String(px)}`]: {
          name: `${String(px)}px`,
          styles: { width: `${String(px)}px`, height: "800px" },
        },
      },
    },
  },
});

export const SingleColumn: Story = {
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(getComputedStyle(grid).display).toBe("grid");
    await expect(columnCount(grid)).toBe(1);
    await expect(getComputedStyle(grid).rowGap).toBe("16px");
  },
};

export const TwoColumns: Story = {
  args: { columns: 2 },
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(columnCount(grid)).toBe(expectedColumns(2));
  },
};

export const ThreeColumns: Story = {
  args: { columns: 3, gap: 6 },
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(columnCount(grid)).toBe(expectedColumns(3));
    await expect(getComputedStyle(grid).columnGap).toBe("24px");
  },
};

export const FourColumns: Story = {
  args: { columns: 4 },
  play: async ({ canvas }) => {
    const grid = parentOf(canvas.getByText("One"));
    await expect(columnCount(grid)).toBe(expectedColumns(4));
  },
};

export const AtTheSmBreakpoint: Story = {
  ...atWidth(SM_PX),
  args: { columns: 4 },
  play: async ({ canvas }) => {
    await expect(parseFloat(breakpointSm()) * 16).toBe(SM_PX);
    await expect(window.innerWidth).toBe(SM_PX);
    await expect(columnCount(parentOf(canvas.getByText("One")))).toBe(4);
  },
};

export const JustBelowTheSmBreakpoint: Story = {
  ...atWidth(SM_PX - 1),
  args: { columns: 4 },
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBe(SM_PX - 1);
    await expect(columnCount(parentOf(canvas.getByText("One")))).toBe(1);
  },
};

export const CallerColumns: Story = {
  args: { columns: 4, className: "grid-cols-2" },
  play: async ({ canvas }) => {
    await expect(columnCount(parentOf(canvas.getByText("One")))).toBe(2);
  },
};

export const WithConsumerGridCols1: Story = {
  args: { columns: 4 },
  render: (args) => (
    <>
      <style>
        {".grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}"}
      </style>
      <Grid {...args} />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(columnCount(parentOf(canvas.getByText("One")))).toBe(
      expectedColumns(4),
    );
  },
};
