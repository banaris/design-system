import { Field, FieldHint, FieldLabel, Slider } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { resolveToken } from "./border-color";

const sliderTrack = (thumb: HTMLElement) => {
  const track = thumb.closest("[data-index]")?.parentElement;
  if (!track) throw new Error("slider track not found");
  return track;
};

const trackBorder = (thumb: HTMLElement) =>
  getComputedStyle(sliderTrack(thumb)).borderTopColor;

const sliderControl = (thumb: HTMLElement) => {
  const control = sliderTrack(thumb).parentElement;
  if (!control) throw new Error("slider control not found");
  return control;
};

/* `vitest/browser` throws when imported outside Vitest, so a plain Storybook
 * gets no commands and the touch assertions below are skipped. */
const touchCommands = async () => {
  if (!matchMedia("(any-pointer: coarse)").matches) return null;
  try {
    return (await import("vitest/browser")).commands;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Browser Mode"))
      return null;
    throw error;
  }
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

    const track = sliderTrack(thumb);
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
  args: { step: 5, onValueChange: fn(), onValueCommitted: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = sliderTrack(thumb);
    await expect(getComputedStyle(sliderControl(thumb)).touchAction).toBe(
      "pan-y",
    );
    const commands = await touchCommands();
    if (!commands) return;
    track.dataset["touchTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    await commands.tap("[data-touch-target]", width * 0.8, height / 2);
    /* `thumbAlignment="edge"` insets the usable track by the thumb size, so the
     * value lands within one step of the tapped 80%, not exactly on it. */
    await expect(
      Math.abs(Number(thumb.getAttribute("aria-valuenow")) - 80),
    ).toBeLessThanOrEqual(5);
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};

export const TouchTapCancelled: Story = {
  args: {
    onValueChange: fn((_value: number, details: { cancel: () => void }) => {
      details.cancel();
    }),
    onValueCommitted: fn(),
  },
  play: async ({ args, canvas }) => {
    const commands = await touchCommands();
    if (!commands) return;
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = sliderTrack(thumb);
    track.dataset["touchTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    await commands.tap("[data-touch-target]", width * 0.8, height / 2);
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const TouchSwipe: Story = {
  args: { step: 5, onValueChange: fn(), onValueCommitted: fn() },
  decorators: [
    (Story) => (
      <div className="h-[200vh] w-72">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas }) => {
    const commands = await touchCommands();
    if (!commands) return;
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = sliderTrack(thumb);
    track.dataset["touchTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    const before = window.scrollY;
    await commands.swipe(
      "[data-touch-target]",
      width * 0.8,
      height / 2,
      8,
      -200,
    );
    await expect(window.scrollY).toBeGreaterThan(before);
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const TouchSwipeWithoutCancel: Story = {
  args: { step: 5, onValueChange: fn(), onValueCommitted: fn() },
  decorators: [
    (Story) => (
      <div className="w-72 touch-none">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas }) => {
    const commands = await touchCommands();
    if (!commands) return;
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = sliderTrack(thumb);
    track.dataset["touchTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    /* A `touch-none` parent stops the browser panning, so the pointer is never
     * cancelled and the release reaches the control as a real `pointerup`. */
    const events: string[] = [];
    for (const type of ["pointercancel", "pointerup"]) {
      sliderControl(thumb).addEventListener(type, () => events.push(type));
    }
    await commands.swipe("[data-touch-target]", width * 0.8, height / 2, 2, 40);
    await expect(events).toEqual(["pointerup"]);
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const CancelledChange: Story = {
  args: {
    onValueChange: fn((_value: number, details: { cancel: () => void }) => {
      details.cancel();
    }),
    onValueCommitted: fn(),
  },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const TouchDrag: Story = {
  args: { step: 5, onValueCommitted: fn() },
  play: async ({ args, canvas }) => {
    const commands = await touchCommands();
    if (!commands) return;
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const track = sliderTrack(thumb);
    track.dataset["touchTarget"] = "";
    const { width, height } = track.getBoundingClientRect();
    await commands.swipe(
      "[data-touch-target]",
      width * 0.2,
      height / 2,
      100,
      0,
    );
    const value = Number(thumb.getAttribute("aria-valuenow"));
    await expect(value).toBeGreaterThanOrEqual(50);
    await expect(value).toBeLessThanOrEqual(60);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
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
