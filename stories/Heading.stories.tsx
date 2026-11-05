import { Heading } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Typography/Heading",
  component: Heading,
  args: { level: 1, children: "Weekly summary" },
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3] },
    size: {
      control: "select",
      options: [undefined, "display", "h1", "h2", "h3"],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
    </div>
  ),
};

export const SizeOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading level={2} size="display">
        Level 2, display look
      </Heading>
      <Heading level={1} size="h3">
        Level 1, h3 look
      </Heading>
    </div>
  ),
};
