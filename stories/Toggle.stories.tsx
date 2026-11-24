import { Field, FieldLabel, Toggle } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Actions/Toggle",
  component: Toggle,
  args: { children: "Bold", onPressedChange: fn() },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pressing: Story = {
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Bold" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(
      true,
      expect.anything(),
    );
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(
      false,
      expect.anything(),
    );
  },
};

export const Pressed: Story = {
  args: { defaultPressed: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Bold" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(getComputedStyle(toggle).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Bold" });
    await userEvent.click(toggle);
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Toggle {...args} size="sm">
        Small
      </Toggle>
      <Toggle {...args} size="md">
        Medium
      </Toggle>
      <Toggle {...args} size="lg">
        Large
      </Toggle>
    </div>
  ),
};

export const InField: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>Formatting</FieldLabel>
      <Toggle {...args}>Italic</Toggle>
    </Field>
  ),
};
