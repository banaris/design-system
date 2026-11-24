import { Progress } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { value: 40, label: "Uploading", className: "max-w-96" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Uploading" });
    await expect(bar).toHaveAttribute("aria-valuenow", "40");
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
  },
};

export const WithValue: Story = {
  args: { showValue: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("40%")).toBeVisible();
  },
};

export const Complete: Story = {
  args: { value: 100, showValue: true },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Uploading" });
    await expect(bar).toHaveAttribute("data-complete");
    const indicator = [...bar.querySelectorAll("div")].at(-1);
    await expect(indicator).toHaveAttribute("data-complete");
  },
};

export const Indeterminate: Story = {
  args: { value: null },
  tags: ["reduced-motion"],
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Uploading" });
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    await expect(bar).toHaveAttribute("data-indeterminate");
    const indicator = [...bar.querySelectorAll("div")].at(-1);
    if (!(indicator instanceof HTMLElement)) throw new Error("no indicator");
    await expect(getComputedStyle(indicator).animationName).toBe(
      matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "none"
        : "ds-pulse",
    );
  },
};

export const Unlabelled: Story = {
  args: { label: undefined, "aria-label": "Battery" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("progressbar", { name: "Battery" }),
    ).toBeVisible();
  },
};

export const Stacked: Story = {
  render: (args) => (
    <div className="flex w-full max-w-96 flex-col gap-4">
      <Progress {...args} label="Photos" value={80} showValue />
      <Progress {...args} label="Videos" value={10} showValue />
      <Progress {...args} label="Documents" value={null} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("progressbar")).toHaveLength(3);
    await expect(canvas.getByText("80%")).toBeVisible();
    await expect(canvas.getByText("10%")).toBeVisible();
  },
};
