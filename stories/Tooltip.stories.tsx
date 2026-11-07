import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectVisible } from "./visible";

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  args: { onOpenChange: fn() },
  render: (args) => (
    <TooltipProvider>
      <Tooltip {...args}>
        <TooltipTrigger render={<Button variant="secondary">Save</Button>} />
        <TooltipContent>Save the draft (⌘S)</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expectVisible(() => screen.findByText("Save the draft (⌘S)"));
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Save" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expectVisible(() => screen.findByText("Save the draft (⌘S)"));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
