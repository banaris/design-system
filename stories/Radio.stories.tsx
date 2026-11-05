import { Radio, RadioGroup } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Forms/Radio",
  component: RadioGroup,
  args: { "aria-label": "Repeat", defaultValue: "daily" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const OPTIONS = ["daily", "weekly", "monthly"] as const;

const options = (props: { disabled?: boolean; invalid?: boolean } = {}) =>
  OPTIONS.map((value) => (
    <label key={value} className="text-ink flex items-center gap-2 text-base">
      <Radio
        value={value}
        disabled={props.disabled}
        aria-invalid={props.invalid === true ? "true" : undefined}
      />
      {value}
    </label>
  ));

export const Default: Story = {
  render: (args) => <RadioGroup {...args}>{options()}</RadioGroup>,
};

export const Selection: Story = {
  args: { name: "repeat", onValueChange: fn() },
  render: (args) => <RadioGroup {...args}>{options()}</RadioGroup>,
  play: async ({ args, canvas }) => {
    const daily = canvas.getByRole("radio", { name: "daily" });
    const weekly = canvas.getByRole("radio", { name: "weekly" });
    const monthly = canvas.getByRole("radio", { name: "monthly" });
    await expect(daily).toBeChecked();
    await userEvent.click(monthly);
    await expect(monthly).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "monthly",
      expect.anything(),
    );
    await userEvent.keyboard("{ArrowLeft}");
    await expect(weekly).toBeChecked();
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <RadioGroup {...args} aria-label="Default">
        {options()}
      </RadioGroup>
      <RadioGroup {...args} aria-label="Invalid">
        {options({ invalid: true })}
      </RadioGroup>
      <RadioGroup {...args} aria-label="Disabled" disabled>
        {options({ disabled: true })}
      </RadioGroup>
      <RadioGroup {...args} aria-label="Disabled and invalid" disabled>
        {options({ disabled: true, invalid: true })}
      </RadioGroup>
    </div>
  ),
};
