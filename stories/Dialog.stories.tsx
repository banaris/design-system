import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectVisible } from "./visible";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  args: { onOpenChange: fn() },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger variant="secondary">Delete project</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>
          Its files and history are removed for everyone.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <DialogClose>Cancel</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Delete this project?" }),
    );
  },
};

export const EscapeReturnsFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    await expectVisible(() => screen.findByRole("dialog"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const CloseControl: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const OutsidePress: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    await expectVisible(() => screen.findByRole("dialog"));
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const FocusMovesIn: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete project" }),
    );
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
  },
};
