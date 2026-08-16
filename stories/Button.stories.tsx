import { Button } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Track a habit" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "accent", "secondary", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="accent">
        Accent
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>Default</Button>
      <Button {...args} disabled>
        Disabled
      </Button>
      <Button {...args} loading>
        Loading
      </Button>
      <Button {...args} pill>
        Pill
      </Button>
    </div>
  ),
};

/* The override the merge configuration exists to make work: a caller's utility
 * beats the variant with no `!` and no wrapper. */
export const ClassNameOverride: Story = {
  args: { variant: "accent", className: "rounded-pill px-8" },
};
