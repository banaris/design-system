import { List, ListItem } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { resolveToken } from "./border-color";

const meta = {
  title: "Surfaces/List",
  component: List,
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <List {...args} aria-label="Today">
      <ListItem>09:00 Standup</ListItem>
      <ListItem>10:30 Review the table PR</ListItem>
      <ListItem>14:00 Plan the sprint</ListItem>
    </List>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    const first = canvas.getByText("09:00 Standup");
    const last = canvas.getByText("14:00 Plan the sprint");
    await expect(getComputedStyle(first).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(last).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(last).borderTopColor).toBe(
      resolveToken("--color-border"),
    );
    await expect(getComputedStyle(last).borderBottomWidth).toBe("0px");
    await expect(getComputedStyle(last).borderLeftWidth).toBe("0px");
  },
};
