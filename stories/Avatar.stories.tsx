import { Avatar } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

const PICTURE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#2f6f4f"/></svg>',
  );

const meta = {
  title: "Surfaces/Avatar",
  component: Avatar,
  args: { "aria-label": "Ada Lovelace", children: "AL" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await expect(avatar).toHaveTextContent("AL");
  },
};

export const WithPicture: Story = {
  args: { src: PICTURE },
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await waitFor(() => expect(avatar.querySelector("img")).not.toBeNull());
    await expect(avatar).not.toHaveTextContent("AL");
  },
};

export const BrokenPicture: Story = {
  args: { src: "data:image/png;base64,broken" },
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole("img", { name: "Ada Lovelace" });
    await waitFor(() => expect(avatar).toHaveTextContent("AL"));
    await expect(avatar.querySelector("img")).toBeNull();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = canvas
      .getAllByRole("img", { name: "Ada Lovelace" })
      .map((avatar) => avatar.getBoundingClientRect().width);
    await expect(sizes).toEqual([32, 40, 56]);
  },
};
