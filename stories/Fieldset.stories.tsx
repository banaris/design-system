import {
  Checkbox,
  CheckboxGroup,
  Fieldset,
  FieldsetError,
  FieldsetHint,
  FieldsetLegend,
  Radio,
  RadioGroup,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Forms/Fieldset",
  component: Fieldset,
  args: { error: "" },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

const label = "text-ink text-ds-base flex items-center gap-2";

export const RadioChoice: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetLegend>Repeat</FieldsetLegend>
      <FieldsetHint>How often the habit comes back.</FieldsetHint>
      <RadioGroup defaultValue="daily" name="repeat">
        {["daily", "weekly"].map((value) => (
          <label key={value} className={label}>
            <Radio value={value} />
            {value}
          </label>
        ))}
      </RadioGroup>
      <FieldsetError />
    </Fieldset>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole("radiogroup", { name: "Repeat" });
    await expect(group).toBeVisible();
    await expect(
      canvas.getByRole("group", { name: "Repeat" }),
    ).toHaveAccessibleDescription("How often the habit comes back.");
  },
};

export const CheckboxChoiceWithError: Story = {
  args: { error: "Pick at least one day." },
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetLegend>Days</FieldsetLegend>
      <FieldsetHint>Reminders go out on these days.</FieldsetHint>
      <CheckboxGroup defaultValue={[]}>
        {["mon", "tue"].map((value) => (
          <label key={value} className={label}>
            <Checkbox name={value} />
            {value}
          </label>
        ))}
      </CheckboxGroup>
      <FieldsetError />
    </Fieldset>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Pick at least one day.",
    );
    await expect(
      canvas.getByRole("group", { name: "Days" }),
    ).toHaveAccessibleDescription(
      "Reminders go out on these days. Pick at least one day.",
    );
  },
};
