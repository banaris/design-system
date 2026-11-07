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

export const ValueChange: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    await userEvent.type(canvas.getByRole("textbox"), "Hi");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "Hi",
      expect.anything(),
    );
  },
};

export const FieldStateWithRef: Story = {
  args: { "aria-label": undefined, defaultValue: "Read", ref: fn() },
  render: (args) => (
    <Field>
      <FieldLabel>Notes</FieldLabel>
      <Textarea {...args} />
    </Field>
  ),
  play: async ({ args, canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Notes" });
    await expect(args.ref).toHaveBeenCalledWith(textarea);
    await expect(textarea).toHaveAttribute("data-filled");
  },
};

export const KeepsFieldAria: Story = {
  args: {
    "aria-label": undefined,
    "aria-describedby": "extra-note",
    "aria-invalid": false,
  },
  render: (args) => (
    <>
      <Field error="Write a note.">
        <FieldLabel>Notes</FieldLabel>
        <Textarea {...args} />
        <FieldHint>Markdown is not rendered.</FieldHint>
        <FieldError />
      </Field>
      <p id="extra-note">Shown to the whole team.</p>
    </>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Notes" });
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveAccessibleDescription(
      "Shown to the whole team. Markdown is not rendered. Write a note.",
    );
  },
};

export const SizedByRows: Story = {
  args: { rows: 6 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toHaveAttribute("rows", "6");
  },
};
