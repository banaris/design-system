import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectVisible } from "./visible";

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  args: { onOpenChange: fn() },
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      <Popover {...args}>
        <PopoverTrigger variant="secondary">Shortcuts</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Keyboard shortcuts</PopoverTitle>
          <PopoverDescription>
            Press ? anywhere to see them all.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
      <p className="text-ink text-base">Elsewhere on the page</p>
    </div>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expectVisible(() => screen.findByText("Keyboard shortcuts"));
  },
};

export const EscapeReturnsFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Shortcuts" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expectVisible(() => screen.findByRole("dialog"));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const OutsidePress: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Shortcuts" }));
    await expectVisible(() => screen.findByRole("dialog"));
    await userEvent.click(canvas.getByText("Elsewhere on the page"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};
