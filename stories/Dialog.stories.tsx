import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

export const SelectInside: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger variant="secondary">Edit</DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit project</DialogTitle>
        <Select
          items={[
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ]}
        >
          <SelectTrigger aria-label="Plan" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await userEvent.click(
      await screen.findByRole("combobox", { name: "Plan" }),
    );
    const option = await screen.findByRole("option", { name: "Alpha" });
    await waitFor(async () => {
      const box = option.getBoundingClientRect();
      const top = document.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
      await expect(option.contains(top)).toBe(true);
    });
  },
};

export const TallContent: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger variant="secondary">Terms</DialogTrigger>
      <DialogContent>
        <DialogTitle>Terms</DialogTitle>
        {Array.from({ length: 60 }, (_, index) => (
          <DialogDescription key={index}>Clause {index + 1}</DialogDescription>
        ))}
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Terms" }));
    const dialog = await expectVisible(() => screen.findByRole("dialog"));
    await waitFor(() =>
      expect(dialog.getBoundingClientRect().height).toBeLessThanOrEqual(
        window.innerHeight,
      ),
    );
    await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
  },
};
