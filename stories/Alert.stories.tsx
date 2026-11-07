import { Alert } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  args: { children: "Your changes were saved." },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Saved" },
};

export const Statuses: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <Alert status="success" title="Saved">
        Your changes were saved.
      </Alert>
      <Alert status="info" title="Heads up">
        A new version is available.
      </Alert>
      <Alert status="warning" title="Almost full">
        Storage is at 90%.
      </Alert>
      <Alert status="danger" title="Upload failed">
        The file is larger than the 10 MB limit.
      </Alert>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("alert")).toHaveLength(2);
    await expect(canvas.getAllByRole("status")).toHaveLength(2);
  },
};

export const WithoutTitle: Story = {
  args: { status: "danger" },
};
