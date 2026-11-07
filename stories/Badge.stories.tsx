import { Badge } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Feedback/Badge",
  component: Badge,
  args: { children: "Draft" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Statuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Neutral</Badge>
      <Badge status="success">Published</Badge>
      <Badge status="warning">Pending</Badge>
      <Badge status="danger">Failed</Badge>
      <Badge status="info">New</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const name of ["Published", "Pending", "Failed", "New"]) {
      await expect(canvas.getByText(name)).toBeVisible();
    }
  },
};
