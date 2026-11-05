import { ErrorMessage } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Feedback/ErrorMessage",
  component: ErrorMessage,
  args: { children: "Could not load your entries. Try again." },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ErrorMessage>{""}</ErrorMessage>
      <ErrorMessage>{null}</ErrorMessage>
    </div>
  ),
};
