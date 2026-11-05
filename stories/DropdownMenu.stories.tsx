import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Actions/DropdownMenu",
  component: DropdownMenu,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const menu = (props: { onSignOut?: () => void; disabledItem?: boolean }) => (
  <>
    <DropdownMenuTrigger variant="secondary">Account</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLinkItem href="#account">Account page</DropdownMenuLinkItem>
      <DropdownMenuItem disabled={props.disabledItem}>Export</DropdownMenuItem>
      <DropdownMenuItem onClick={props.onSignOut}>Sign out</DropdownMenuItem>
    </DropdownMenuContent>
  </>
);

export const Default: Story = {
  render: (args) => <DropdownMenu {...args}>{menu({})}</DropdownMenu>,
};

export const Open: Story = {
  args: { defaultOpen: true },
  render: (args) => <DropdownMenu {...args}>{menu({})}</DropdownMenu>,
  play: async () => {
    await expect(await screen.findByRole("menu")).toBeVisible();
    await expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  },
};

export const DisabledItem: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <DropdownMenu {...args}>{menu({ disabledItem: true })}</DropdownMenu>
  ),
  play: async () => {
    await expect(
      await screen.findByRole("menuitem", { name: "Export" }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

export const LinkItem: Story = {
  args: { defaultOpen: true },
  render: (args) => <DropdownMenu {...args}>{menu({})}</DropdownMenu>,
  play: async () => {
    const link = await screen.findByRole("menuitem", { name: "Account page" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#account");
  },
};

export const Keyboard: Story = {
  args: { onOpenChange: fn() },
  render: (args) => (
    <DropdownMenu {...args}>{menu({ disabledItem: true })}</DropdownMenu>
  ),
  play: async ({ args, canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Account" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(await screen.findByRole("menu")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const account = screen.getByRole("menuitem", { name: "Account page" });
    const exportItem = screen.getByRole("menuitem", { name: "Export" });
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(account).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(exportItem).toHaveFocus());
    await expect(exportItem).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(account).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onOpenChange).toHaveBeenCalled();
  },
};

export const OutsideClick: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      <DropdownMenu {...args}>{menu({})}</DropdownMenu>
      <p className="text-ink text-base">Elsewhere on the page</p>
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    await expect(await screen.findByRole("menu")).toBeVisible();
    await userEvent.click(canvas.getByText("Elsewhere on the page"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};

const onSignOut = fn();

export const ItemAction: Story = {
  render: (args) => (
    <DropdownMenu {...args}>{menu({ onSignOut })}</DropdownMenu>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Sign out" }),
    );
    await expect(onSignOut).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};
