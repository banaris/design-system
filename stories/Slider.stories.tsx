import { Field, FieldHint, FieldLabel, Slider } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

const meta = {
  title: "Forms/Slider",
  component: Slider,
  args: { "aria-label": "Volume", defaultValue: 40 },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveValue("40");
  },
};

export const Interacting: Story = {
  args: { step: 5, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveValue("45");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      45,
      expect.anything(),
    );
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(thumb).toHaveValue("35");
    await userEvent.keyboard("{End}");
    await expect(thumb).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    await expect(thumb).toHaveValue("0");

    const control = thumb.closest("[data-index]")?.parentElement;
    if (!control) throw new Error("slider control not found");
    const { left, width, top, height } = control.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft]",
        target: control,
        coords: { clientX: left + width * 0.7, clientY: top + height / 2 },
      },
    ]);
    await expect(thumb).toHaveValue("70");
  },
};

export const Bounds: Story = {
  args: { min: 10, max: 20, step: 2, defaultValue: 14, "aria-label": "Steps" },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Steps" });
    await expect(thumb).toHaveAttribute("min", "10");
    await expect(thumb).toHaveAttribute("max", "20");
    await expect(thumb).toHaveAttribute("step", "2");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveValue("16");
  },
};

export const Disabled: Story = {
  args: { disabled: true, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await expect(thumb).toBeDisabled();
    await userEvent.keyboard("{Tab}");
    await expect(thumb).not.toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Pick a level above zero.">
      <FieldLabel>Brightness</FieldLabel>
      <Slider {...args} />
      <FieldHint>Applies to every panel.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Brightness" });
    await expect(thumb).toHaveAccessibleDescription("Applies to every panel.");
  },
};
