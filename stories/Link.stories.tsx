import { Link } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
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

const onOwnClick = fn();
const onLinkClick = fn();

export const KeepsBothClickHandlers: Story = {
  render: () => (
    <Link
      onClick={onLinkClick}
      render={
        <RouterLink to="/habits" onNavigate={onNavigate} onClick={onOwnClick} />
      }
    >
      Track a click
    </Link>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Track a click" }));
    await expect(onOwnClick).toHaveBeenCalledOnce();
    await expect(onLinkClick).toHaveBeenCalledOnce();
  },
};

const ActiveLink = ({
  className,
  children,
  ...rest
}: Omit<ComponentProps<"a">, "className"> & {
  className: (state: { isActive: boolean }) => string;
}) => (
  <a className={className({ isActive: true })} {...rest}>
    {children}
  </a>
);

export const FunctionClassName: Story = {
  render: () => (
    <Link
      className="font-semibold"
      render={
        <ActiveLink
          href="#habits"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        />
      }
    >
      Open habits
    </Link>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Open habits" });
    await expect(link).toHaveClass("is-active", "font-semibold", "underline");
  },
};

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
