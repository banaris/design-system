import {
  Field,
  FieldHint,
  FieldLabel,
  NumberField,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { resolveToken } from "./border-color";

const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  args: {
    "aria-label": "Quantity",
    defaultValue: 2,
    min: 0,
    max: 10,
    onValueChange: fn(),
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Stepping: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await expect(input).toHaveValue("2");
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(input).toHaveValue("3");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      3,
      expect.anything(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }));
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }));
    await expect(input).toHaveValue("1");
  },
};

export const Typing: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.clear(input);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.anything(),
    );
    await userEvent.type(input, "7");
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      7,
      expect.anything(),
    );
    await expect(input).toHaveValue("7");
  },
};

export const RejectsLetters: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.clear(input);
    await userEvent.type(input, "abc");
    await userEvent.tab();
    await expect(input).not.toHaveValue("abc");
    await expect(input).toHaveValue("");
  },
};

export const Limits: Story = {
  args: { defaultValue: 10 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Increase" }),
    ).toHaveAttribute("data-disabled");
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.clear(input);
    await userEvent.type(input, "99");
    await userEvent.tab();
    await expect(input).toHaveValue("10");
  },
};

export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("3");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(input).toHaveValue("1");
  },
};

export const CustomLabels: Story = {
  args: { decrementLabel: "Verringern", incrementLabel: "Erhöhen" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Verringern" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Erhöhen" })).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Quantity" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Increase" }),
    ).toHaveAttribute("data-disabled");
  },
};

export const InFieldWithCustomLabel: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field>
      <FieldLabel nativeLabel={false}>Seats</FieldLabel>
      <NumberField {...args} />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Seats" })).toBeVisible();
  },
};

export const DescribedAndInvalid: Story = {
  args: { "aria-label": "Seats" },
  render: (args) => (
    <div>
      <NumberField
        {...args}
        aria-describedby="seats-hint"
        aria-invalid
        aria-errormessage="seats-hint"
        aria-details="seats-hint"
      />
      <p id="seats-hint">How many people are coming.</p>
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Seats" });
    await expect(input).toHaveAccessibleDescription(
      "How many people are coming.",
    );
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-details", "seats-hint");
    await expect(input.closest("[aria-details]")).toBe(input);
    await expect(getComputedStyle(input).borderTopColor).toBe(
      resolveToken("--color-danger"),
    );
  },
};

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Pick at least one.">
      <FieldLabel>Seats</FieldLabel>
      <NumberField {...args} />
      <FieldHint>How many people are coming.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Seats" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "How many people are coming.",
    );
  },
};
