import { Link } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { RouterLink } from "./router-link";

const meta = {
  title: "Typography/Link",
  component: Link,
  args: { href: "#habits", children: "your habits" },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "your habits" });
    await expect(link).toHaveAttribute("href", "#habits");
  },
};

export const InText: Story = {
  render: (args) => (
    <p className="text-body text-ink max-w-prose">
      Tracked 6 hours across 3 projects this week. Review <Link {...args} /> or
      read the{" "}
      <Link {...args} href="#guide">
        guide to a steady routine, written for people who return after a long
        break
      </Link>{" "}
      to keep the streak going.
    </p>
  ),
};

const onNavigate = fn();

export const RenderedAsRouterLink: Story = {
  render: () => (
    <Link render={<RouterLink to="/habits" onNavigate={onNavigate} />}>
      Open habits
    </Link>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Open habits" });
    await expect(link).toHaveAttribute("href", "/habits");
    await userEvent.click(link);
    await expect(onNavigate).toHaveBeenCalledWith("/habits");
  },
};
