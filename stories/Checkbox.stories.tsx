import { Checkbox, Field, FieldHint, FieldLabel } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { expectStateBorders } from "./border-color";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Remind me" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox")).toBePartiallyChecked();
  },
};

export const Toggling: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvas }) => {
    const checkbox = canvas.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.anything(),
    );
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      false,
      expect.anything(),
    );
  },
};

export const States: Story = {
  play: async ({ canvas }) => {
    await expectStateBorders({
      resting: canvas.getByRole("checkbox", { name: "Default" }),
      invalid: canvas.getByRole("checkbox", { name: "Invalid" }),
      disabled: canvas.getByRole("checkbox", { name: "Disabled" }),
      disabledInvalid: canvas.getByRole("checkbox", {
        name: "Disabled and invalid",
      }),
    });
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} aria-label="Default" />
      <Checkbox {...args} aria-label="Invalid" aria-invalid="true" />
      <Checkbox {...args} aria-label="Disabled" disabled />
      <Checkbox
        {...args}
        aria-label="Disabled and invalid"
        aria-invalid="true"
        disabled
      />
      <Checkbox {...args} aria-label="Checked" defaultChecked />
      <Checkbox
        {...args}
        aria-label="Checked, disabled"
        defaultChecked
        disabled
      />
      <Checkbox {...args} aria-label="Indeterminate" indeterminate />
    </div>
  ),
};

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Accept the terms to continue.">
      <FieldLabel>Accept the terms</FieldLabel>
      <Checkbox {...args} />
      <FieldHint>You can change this later.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept the terms" });
    await expect(checkbox).toHaveAttribute("aria-invalid", "true");
    await expect(checkbox).toHaveAccessibleDescription(
      "You can change this later.",
    );
    await userEvent.click(canvas.getByText("Accept the terms"));
    await expect(checkbox).toBeChecked();
  },
};
