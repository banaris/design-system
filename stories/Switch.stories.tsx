import { Field, FieldHint, FieldLabel, Switch } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { drawnBox, expectStateBorders } from "./border-color";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  args: { "aria-label": "Notifications" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Toggling: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole("switch");
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.anything(),
    );
    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(
      false,
      expect.anything(),
    );
  },
};

export const DrawnSize: Story = {
  play: async ({ canvas }) => {
    const track = drawnBox(canvas.getByRole("switch"));
    const box = track.getBoundingClientRect();
    await expect([box.width, box.height]).toEqual([44, 24]);
    const thumb = track.firstElementChild?.getBoundingClientRect();
    await expect([thumb?.width, thumb?.height]).toEqual([16, 16]);
    await expect(thumb?.left).toBe(box.left + 5);
  },
};

export const CheckedThumbPosition: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    const track = drawnBox(canvas.getByRole("switch"));
    const box = track.getBoundingClientRect();
    const thumb = track.firstElementChild?.getBoundingClientRect();
    await expect(box.right - (thumb?.right ?? 0)).toBe(5);
  },
};

export const States: Story = {
  play: async ({ canvas }) => {
    await expectStateBorders({
      resting: drawnBox(canvas.getByRole("switch", { name: "Default" })),
      invalid: drawnBox(canvas.getByRole("switch", { name: "Invalid" })),
      disabled: drawnBox(canvas.getByRole("switch", { name: "Disabled" })),
      disabledInvalid: drawnBox(
        canvas.getByRole("switch", { name: "Disabled and invalid" }),
      ),
    });
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Switch {...args} aria-label="Default" />
      <Switch {...args} aria-label="Invalid" aria-invalid="true" />
      <Switch {...args} aria-label="Disabled" disabled />
      <Switch
        {...args}
        aria-label="Disabled and invalid"
        aria-invalid="true"
        disabled
      />
      <Switch {...args} aria-label="On" defaultChecked />
      <Switch {...args} aria-label="On, disabled" defaultChecked disabled />
    </div>
  ),
};

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Turn this on to continue.">
      <FieldLabel>Email notifications</FieldLabel>
      <Switch {...args} />
      <FieldHint>Sent once a day.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("switch", { name: "Email notifications" });
    await expect(toggle).toHaveAttribute("aria-invalid", "true");
    await expect(toggle).toHaveAccessibleDescription("Sent once a day.");
    await userEvent.click(canvas.getByText("Email notifications"));
    await expect(toggle).toBeChecked();
  },
};
