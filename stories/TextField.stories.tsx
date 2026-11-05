import { Button, TextField } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { expectStateBorders } from "./border-color";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  args: { "aria-label": "Habit name", placeholder: "Morning run" },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Typing: Story = {
  args: { onChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "Read");
    await expect(input).toHaveValue("Read");
    await expect(args.onChange).toHaveBeenCalledTimes(4);
  },
};

export const States: Story = {
  play: async ({ canvas }) => {
    await expectStateBorders({
      resting: canvas.getByLabelText("Default"),
      invalid: canvas.getByLabelText("Invalid"),
      disabled: canvas.getByLabelText("Disabled"),
      disabledInvalid: canvas.getByLabelText("Disabled and invalid"),
    });
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TextField {...args} aria-label="Default" />
      <TextField {...args} aria-label="Invalid" aria-invalid="true" />
      <TextField {...args} aria-label="Disabled" disabled />
      <TextField
        {...args}
        aria-label="Disabled and invalid"
        aria-invalid="true"
        disabled
      />
    </div>
  ),
};

export const ClassNameOverride: Story = {
  args: { className: "rounded-pill px-8" },
};

export const MatchesButtonHeight: Story = {
  render: (args) => (
    <div className="flex items-start gap-3">
      <TextField {...args} />
      <Button>Save</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const height = (el: HTMLElement) => el.getBoundingClientRect().height;
    await expect(
      height(canvas.getByLabelText(meta.args["aria-label"])),
    ).toBeCloseTo(height(canvas.getByRole("button", { name: "Save" })), 1);
  },
};
