import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Textarea,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { expectStateBorders } from "./border-color";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  args: { "aria-label": "Notes", placeholder: "Anything worth remembering" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Typing: Story = {
  args: { onChange: fn() },
  play: async ({ args, canvas }) => {
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Read{Enter}Run");
    await expect(textarea).toHaveValue("Read\nRun");
    await expect(args.onChange).toHaveBeenCalledTimes(8);
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
      <Textarea {...args} aria-label="Default" />
      <Textarea {...args} aria-label="Invalid" aria-invalid="true" />
      <Textarea {...args} aria-label="Disabled" disabled />
      <Textarea
        {...args}
        aria-label="Disabled and invalid"
        aria-invalid="true"
        disabled
      />
    </div>
  ),
};

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Write a note.">
      <FieldLabel>Notes</FieldLabel>
      <Textarea {...args} />
      <FieldHint>Markdown is not rendered.</FieldHint>
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Notes" });
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveAccessibleDescription(
      "Markdown is not rendered. Write a note.",
    );
    await userEvent.click(canvas.getByText("Notes"));
    await expect(textarea).toHaveFocus();
  },
};
