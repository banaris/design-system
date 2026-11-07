import {
  Button,
  Toaster,
  ToastProvider,
  useToast,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { expectVisible } from "./visible";

function Trigger({ timeout }: { timeout?: number }) {
  const { add } = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        add({
          title: "Draft saved",
          description: "Saved a moment ago.",
          ...(timeout !== undefined && { timeout }),
        });
      }}
    >
      Save draft
    </Button>
  );
}

const meta = {
  title: "Overlays/Toast",
  component: Toaster,
  render: (args) => (
    <ToastProvider>
      <Trigger />
      <Toaster {...args} />
    </ToastProvider>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dismiss: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await expectVisible(() => screen.findByText("Draft saved"));
    await userEvent.click(screen.getByLabelText("Dismiss"));
    await waitFor(() => expect(screen.queryByText("Draft saved")).toBeNull());
  },
};

export const Timeout: Story = {
  render: (args) => (
    <ToastProvider>
      <Trigger timeout={400} />
      <Toaster {...args} />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await expectVisible(() => screen.findByText("Draft saved"));
    await waitFor(() => expect(screen.queryByText("Draft saved")).toBeNull(), {
      timeout: 3000,
    });
  },
};

export const CloseLabel: Story = {
  args: { closeLabel: "Schließen" },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await expectVisible(() => screen.findByLabelText("Schließen"));
  },
};
