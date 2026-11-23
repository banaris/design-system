import { IconButton } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RotateCcw } from "lucide-react";
import { expect } from "storybook/test";

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  args: { icon: RotateCcw, "aria-label": "Reset" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "accent", "secondary", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Reset" })).toBeVisible();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="accent" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} variant="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton {...args} size="xs" aria-label="Reset xs" />
      <IconButton {...args} size="sm" aria-label="Reset sm" />
      <IconButton {...args} size="md" aria-label="Reset md" />
      <IconButton {...args} size="lg" aria-label="Reset lg" />
    </div>
  ),
  play: async ({ canvas }) => {
    const floor = matchMedia("(any-pointer: coarse)").matches ? 44 : 0;
    const edges = { xs: 24, sm: 32, md: 40, lg: 48 };
    for (const [size, drawn] of Object.entries(edges)) {
      const edge = Math.max(drawn, floor);
      const { width, height } = canvas
        .getByRole("button", { name: `Reset ${size}` })
        .getBoundingClientRect();
      await expect([width, height]).toEqual([edge, edge]);
    }
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton {...args} aria-label="Default" />
      <IconButton {...args} aria-label="Disabled" disabled />
      <IconButton {...args} aria-label="Pill" pill />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Disabled" }),
    ).toHaveAttribute("data-disabled");
  },
};

export const RequiresAccessibleName: Story = {
  render: () => (
    // @ts-expect-error `aria-label` is required
    <IconButton icon={RotateCcw} />
  ),
  tags: ["!dev", "!test"],
};
