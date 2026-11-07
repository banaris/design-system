import {
  Field,
  FieldHint,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectStateBorders } from "./border-color";

const ITEMS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const meta = {
  title: "Forms/Select",
  component: Select,
  args: { items: ITEMS },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Repeat" placeholder="Choose a cadence" />
      <SelectContent>
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { defaultValue: "weekly" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Weekly");
  },
};

export const Choosing: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole("option", { name: "Monthly" }),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "monthly",
      expect.anything(),
    );
    await waitFor(() => expect(trigger).toHaveTextContent("Monthly"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

export const Keyboard: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const trigger = canvas.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Home}");
    const daily = screen.getByRole("option", { name: "Daily" });
    await waitFor(() => expect(daily).toHaveAttribute("data-highlighted"));
    await userEvent.keyboard("{ArrowDown}");
    const weekly = screen.getByRole("option", { name: "Weekly" });
    await waitFor(() => expect(weekly).toHaveAttribute("data-highlighted"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "weekly",
      expect.anything(),
    );
    await waitFor(() => expect(trigger).toHaveTextContent("Weekly"));
  },
};

export const Open: Story = {
  args: { defaultOpen: true, defaultValue: "daily" },
  play: async () => {
    await expect(await screen.findByRole("listbox")).toBeVisible();
    await expect(screen.getAllByRole("option")).toHaveLength(3);
    await expect(screen.getByRole("option", { name: "Daily" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const States: Story = {
  play: async ({ canvas }) => {
    await expectStateBorders({
      resting: canvas.getByRole("combobox", { name: "Default" }),
      invalid: canvas.getByRole("combobox", { name: "Invalid" }),
      disabled: canvas.getByRole("combobox", { name: "Disabled" }),
      disabledInvalid: canvas.getByRole("combobox", {
        name: "Disabled and invalid",
      }),
    });
  },
  render: (args) => (
    <div className="flex w-64 flex-col gap-3">
      <Select {...args}>
        <SelectTrigger aria-label="Default" placeholder="Choose" />
      </Select>
      <Select {...args}>
        <SelectTrigger
          aria-label="Invalid"
          aria-invalid="true"
          placeholder="Choose"
        />
      </Select>
      <Select {...args} disabled>
        <SelectTrigger aria-label="Disabled" placeholder="Choose" />
      </Select>
      <Select {...args} disabled>
        <SelectTrigger
          aria-label="Disabled and invalid"
          aria-invalid="true"
          placeholder="Choose"
        />
      </Select>
    </div>
  ),
};

export const InField: Story = {
  render: (args) => (
    <Field error="Pick a cadence.">
      <FieldLabel>Repeat</FieldLabel>
      <Select {...args}>
        <SelectTrigger placeholder="Choose a cadence" />
        <SelectContent>
          {ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldHint>Applies to new entries.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Repeat" });
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
    await expect(trigger).toHaveAccessibleDescription(
      "Applies to new entries.",
    );
    await userEvent.click(canvas.getByText("Repeat"));
    await expect(await screen.findByRole("listbox")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
