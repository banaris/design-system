import { Button, Spinner } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: { label: "Loading" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="text-ink flex items-center gap-4">
      <Spinner size="sm" label="Small" />
      <Spinner size="md" label="Medium" />
      <Spinner size="lg" label="Large" />
    </div>
  ),
};

export const Decorative: Story = {
  args: { label: undefined },
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector("span");
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
  },
};

export const InsideButton: Story = {
  render: () => (
    <Button loading variant="secondary">
      Saving
    </Button>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Saving" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button.querySelector("[aria-hidden='true']")).not.toBeNull();
  },
};
