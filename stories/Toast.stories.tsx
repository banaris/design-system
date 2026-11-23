import {
  Button,
  Toaster,
  ToastProvider,
  useToast,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectInsideInsets, withInsets } from "./safe-area";
import { expectVisible } from "./visible";

function Trigger({
  timeout,
  count = 1,
  onUndo,
}: {
  timeout?: number;
  count?: number;
  onUndo?: () => void;
}) {
  const { add } = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        for (let index = 0; index < count; index += 1) {
          add({
            title:
              index === 0 ? "Draft saved" : `Draft saved ${String(index + 1)}`,
            description: "Saved a moment ago.",
            timeout: timeout ?? 0,
            ...(onUndo !== undefined && {
              actionProps: { children: "Undo", onClick: onUndo },
            }),
          });
        }
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

export const CloseClearsTheText: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    const close = await screen.findByLabelText("Dismiss");
    const title = await screen.findByText("Draft saved");
    await expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(
      close.getBoundingClientRect().left,
    );
  },
};

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

export const Limit: Story = {
  render: (args) => (
    <ToastProvider>
      <Trigger count={4} />
      <Toaster {...args} />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Draft saved 4");
    await waitFor(async () => {
      const visible = screen
        .getAllByText(/^Draft saved/)
        .filter((title) => title.checkVisibility());
      await expect(visible).toHaveLength(3);
    });
  },
};

const onUndo = fn();

export const Action: Story = {
  render: (args) => (
    <ToastProvider>
      <Trigger onUndo={onUndo} />
      <Toaster {...args} />
    </ToastProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    await expect(onUndo).toHaveBeenCalledOnce();
  },
};

export const InsideSafeArea: Story = {
  play: async ({ canvas }) => {
    await withInsets(async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
      const title = await expectVisible(() => screen.findByText("Draft saved"));
      const toast = title.closest<HTMLElement>('[role="dialog"]');
      if (toast === null) throw new Error("toast root not found");
      await expectInsideInsets(toast);
    });
  },
};

export const OneRemFromTheEdgeWithoutInsets: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    const title = await expectVisible(() => screen.findByText("Draft saved"));
    const toast = title.closest<HTMLElement>('[role="dialog"]');
    if (toast === null) throw new Error("toast root not found");
    await waitFor(async () => {
      const box = toast.getBoundingClientRect();
      await expect(window.innerWidth - box.right).toBeCloseTo(16, 0);
      await expect(window.innerHeight - box.bottom).toBeCloseTo(16, 0);
    });
  },
};
