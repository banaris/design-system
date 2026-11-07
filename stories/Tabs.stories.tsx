import { Tabs, TabsList, TabsPanel, TabsTab } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { defaultValue: "overview", onValueChange: fn() },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList aria-label="Project sections">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings" disabled>
          Settings
        </TabsTab>
      </TabsList>
      <TabsPanel value="overview">Overview content</TabsPanel>
      <TabsPanel value="activity">Activity content</TabsPanel>
      <TabsPanel value="settings">Settings content</TabsPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Keyboard: Story = {
  play: async ({ args, canvas }) => {
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const activity = canvas.getByRole("tab", { name: "Activity" });
    await expect(overview).toHaveAttribute("aria-selected", "true");

    overview.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(activity).toHaveFocus());
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("tabpanel", { name: "Activity" }),
    ).toHaveTextContent("Activity content");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "activity",
      expect.anything(),
    );

    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(overview).toHaveFocus());
    await expect(overview).toHaveAttribute("aria-selected", "true");
  },
};

export const DisabledTab: Story = {
  play: async ({ canvas }) => {
    const settings = canvas.getByRole("tab", { name: "Settings" });
    await expect(settings).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(settings);
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};
