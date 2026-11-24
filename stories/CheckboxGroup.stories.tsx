import { Checkbox, CheckboxGroup } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Forms/CheckboxGroup",
  component: CheckboxGroup,
  args: { "aria-label": "Days", defaultValue: ["mon"], onValueChange: fn() },
  render: (args) => (
    <CheckboxGroup {...args}>
      {["mon", "tue", "wed"].map((value) => (
        <label
          key={value}
          className="text-ink text-ds-base flex items-center gap-2"
        >
          <Checkbox value={value} />
          {value}
        </label>
      ))}
    </CheckboxGroup>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TickingUpdatesTheSharedValue: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "mon" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "wed" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["mon", "wed"],
      expect.anything(),
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "tue" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
};
