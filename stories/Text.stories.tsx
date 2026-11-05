import { Text } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Typography/Text",
  component: Text,
  args: { children: "Tracked 6 hours across 3 projects this week." },
  argTypes: {
    variant: { control: "inline-radio", options: ["body", "small", "label"] },
    as: { control: "inline-radio", options: ["p", "span", "div"] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text variant="body">Body — the default reading size</Text>
      <Text variant="small">Small — supporting prose</Text>
      <Text variant="label" className="uppercase">
        Label
      </Text>
    </div>
  ),
};

export const Elements: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text as="p">A paragraph</Text>
      <div>
        Inline <Text as="span">span</Text> inside a line
      </div>
      <Text as="div">A block without paragraph semantics</Text>
    </div>
  ),
};
