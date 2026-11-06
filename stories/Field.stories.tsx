import {
  Field,
  FieldControl,
  FieldError,
  FieldHint,
  FieldLabel,
  TextField,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Forms/Field",
  component: Field,
  args: { error: "" },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
    </Field>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LabelOnly: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await userEvent.click(canvas.getByText("Habit name"));
    await expect(input).toHaveFocus();
    await expect(input).not.toHaveAttribute("aria-describedby");
    await expect(input).not.toHaveAttribute("aria-invalid", "true");
  },
};

export const WithHint: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
      <FieldHint>Up to 40 characters.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Habit name" }),
    ).toHaveAccessibleDescription("Up to 40 characters.");
  },
};

export const WithError: Story = {
  args: { error: "Enter a name." },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await expect(input).toHaveAccessibleDescription("Enter a name.");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a name.");
  },
};

export const HintAndError: Story = {
  args: { error: "Enter a name." },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
      <FieldHint>Up to 40 characters.</FieldHint>
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await expect(input).toHaveAccessibleDescription(
      "Up to 40 characters. Enter a name.",
    );
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

export const NoHintNoError: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
      <FieldHint />
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(input).not.toHaveAttribute("aria-invalid", "true");
    await expect(input).not.toHaveAttribute("aria-describedby");
  },
};

export const NativeInput: Story = {
  args: { error: "Enter a name." },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Habit name</FieldLabel>
      <FieldControl />
      <FieldHint>Up to 40 characters.</FieldHint>
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await expect(input).toHaveAccessibleDescription(
      "Up to 40 characters. Enter a name.",
    );
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};
