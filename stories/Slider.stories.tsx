import { Field, FieldHint, FieldLabel, Slider } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { commands } from "vitest/browser";

import { resolveToken } from "./border-color";

const trackBorder = (thumb: HTMLElement) => {
  const track = thumb.closest("[data-index]")?.parentElement;
  if (!track) throw new Error("slider track not found");
  return getComputedStyle(track).borderTopColor;
};

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

    const track = thumb.closest("[data-index]")?.parentElement;
    if (!track) throw new Error("slider track not found");
    const { left, width, top, height } = track.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft]",
        target: track,
        coords: { clientX: left + width * 0.7, clientY: top + height / 2 },
      },
    ]);
    await expect(thumb).toHaveValue("70");
  },
};

export const TouchTap: Story = {
  args: { step: 5, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = thumb.closest("[data-index]")?.parentElement;
    const control = track?.parentElement;
    if (!track || !control) throw new Error("slider track not found");
    await expect(getComputedStyle(control).touchAction).toBe("pan-y");
    if (!matchMedia("(any-pointer: coarse)").matches) return;
    track.dataset["tapTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    await commands.tap("[data-tap-target]", width * 0.8, height / 2);
    /* `thumbAlignment="edge"` insets the usable track by the thumb size, so the
     * value lands within one step of the tapped 80%, not exactly on it. */
    await expect(
      Math.abs(Number(thumb.getAttribute("aria-valuenow")) - 80),
    ).toBeLessThanOrEqual(5);
    await expect(args.onValueChange).toHaveBeenCalled();
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

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Slider {...args} aria-label="Default" />
      <Slider {...args} aria-label="Disabled" disabled />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      trackBorder(canvas.getByRole("slider", { name: "Default" })),
    ).toBe(resolveToken("--color-control-border"));
    await expect(
      trackBorder(canvas.getByRole("slider", { name: "Disabled" })),
    ).toBe("rgba(0, 0, 0, 0)");
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
    await expect(thumb).toHaveAttribute("aria-invalid", "true");
    await expect(trackBorder(thumb)).toBe(resolveToken("--color-danger"));
    await userEvent.click(canvas.getByText("Brightness"));
    await expect(thumb).toHaveFocus();
  },
};

export const DisabledInvalid: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Pick a level above zero." disabled>
      <FieldLabel>Brightness</FieldLabel>
      <Slider {...args} />
    </Field>
  ),
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Brightness" });
    await expect(thumb).toBeDisabled();
    await expect(trackBorder(thumb)).toBe("rgba(0, 0, 0, 0)");
  },
};

export const InvalidFocused: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field error="Pick a level above zero.">
      <FieldLabel>Brightness</FieldLabel>
      <Slider {...args} />
    </Field>
  ),
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Brightness" });
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    const box = thumb.closest("[data-index]");
    if (!box) throw new Error("slider thumb not found");
    await new Promise((r) => setTimeout(r, 400));
    await expect(getComputedStyle(box).boxShadow).toContain(
      resolveToken("--color-focus-inner"),
    );
  },
};
