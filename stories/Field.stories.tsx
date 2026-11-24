import {
  Field,
  FieldControl,
  FieldError,
  FieldHint,
  FieldLabel,
  TextField,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";

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
      <FieldControl className="touch-target" />
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

export const NativeRequiredMessage: Story = {
  render: (args) => (
    <Field {...args} validationMode="onBlur">
      <FieldLabel>Habit name</FieldLabel>
      <TextField required defaultValue="Stretch" />
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Habit name" });
    await expect(canvas.queryByRole("alert")).toBeNull();
    await userEvent.clear(input);
    await userEvent.tab();
    const alert = await canvas.findByRole("alert");
    await expect(alert.textContent).not.toBe("");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(alert.textContent);
  },
};

export const NativeMessageMatchedToOneConstraint: Story = {
  render: (args) => (
    <Field {...args} validationMode="onBlur">
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" required defaultValue="me@example.com" />
      <FieldError match="valueMissing">Enter an email.</FieldError>
      <FieldError match="typeMismatch">Use an email address.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.clear(input);
    await userEvent.tab();
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Enter an email.",
    );
    await userEvent.type(input, "ab");
    await userEvent.tab();
    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "Use an email address.",
      ),
    );
  },
};

export const ValidateReturnsTheMessage: Story = {
  render: (args) => (
    <Field
      {...args}
      validate={(value) =>
        typeof value === "string" && value.includes(" ") ? "No spaces." : null
      }
      validationMode="onChange"
    >
      <FieldLabel>Handle</FieldLabel>
      <TextField />
      <FieldError />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Handle" });
    await userEvent.type(input, "a b");
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "No spaces.",
    );
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

export const InvalidPropMarksTheControl: Story = {
  render: (args) => (
    <Field {...args} invalid>
      <FieldLabel>Habit name</FieldLabel>
      <TextField />
      <FieldError>Checked on the server.</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Habit name" }),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Checked on the server.",
    );
  },
};
