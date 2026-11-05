import { DateTimeField } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Forms/DateTimeField",
  component: DateTimeField,
  args: { "aria-label": "Started at" },
} satisfies Meta<typeof DateTimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValuePassthrough: Story = {
  args: { onChange: fn(), defaultValue: "2026-11-05T09:30" },
  play: async ({ args, canvas }) => {
    const input = canvas.getByLabelText("Started at");
    await expect(input).toHaveAttribute("type", "datetime-local");
    await expect(input).toHaveValue("2026-11-05T09:30");
    await userEvent.clear(input);
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <DateTimeField {...args} aria-label="Default" />
      <DateTimeField {...args} aria-label="Invalid" aria-invalid="true" />
      <DateTimeField {...args} aria-label="Disabled" disabled />
      <DateTimeField
        {...args}
        aria-label="Disabled and invalid"
        aria-invalid="true"
        disabled
      />
    </div>
  ),
};
