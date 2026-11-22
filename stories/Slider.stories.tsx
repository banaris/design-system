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

export const WithInput: Story = {
  args: {
    showInput: true,
    step: 5,
    onValueChange: fn(),
    onValueCommitted: fn(),
  },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const input = canvas.getByRole("textbox", { name: "Volume" });
    await expect(input).toHaveValue("40");

    await userEvent.clear(input);
    await userEvent.type(input, "37");
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    await expect(thumb).toHaveValue("35");
    await expect(input).toHaveValue("35");
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      35,
      expect.anything(),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      35,
      expect.anything(),
    );

    await userEvent.clear(input);
    await userEvent.type(input, "150");
    await userEvent.tab();
    await expect(thumb).toHaveValue("100");
    await expect(input).toHaveValue("100");

    await userEvent.clear(input);
    await userEvent.type(input, "-4{Enter}");
    await expect(thumb).toHaveValue("0");

    await userEvent.clear(input);
    await userEvent.type(input, "0{Enter}");
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(3);
  },
};

export const InputRejectsText: Story = {
  args: { showInput: true, onValueChange: fn(), onValueCommitted: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const input = canvas.getByRole("textbox", { name: "Volume" });
    for (const text of ["abc", "1e", "Infinity"]) {
      await userEvent.clear(input);
      await userEvent.type(input, `${text}{Enter}`);
      await expect(input).toHaveValue("40");
      await expect(thumb).toHaveValue("40");
    }
    await userEvent.clear(input);
    await userEvent.tab();
    await expect(input).toHaveValue("40");
    await userEvent.clear(input);
    await userEvent.type(input, "70{Escape}");
    await expect(input).toHaveValue("40");
    await userEvent.tab();
    await expect(thumb).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const InputFollowsSlider: Story = {
  args: { showInput: true, step: 5 },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const input = canvas.getByRole("textbox", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveValue("45");
    await userEvent.keyboard("{End}");
    await expect(input).toHaveValue("100");
  },
};

export const InputBounds: Story = {
  args: {
    showInput: true,
    min: 10,
    max: 20,
    step: 2,
    defaultValue: 14,
    "aria-label": "Steps",
    inputAriaLabel: "Steps value",
  },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Steps" });
    const input = canvas.getByRole("textbox", { name: "Steps value" });
    await userEvent.clear(input);
    await userEvent.type(input, "15{Enter}");
    await expect(thumb).toHaveValue("16");
    await userEvent.clear(input);
    await userEvent.type(input, "99{Enter}");
    await expect(thumb).toHaveValue("20");
    await userEvent.clear(input);
    await userEvent.type(input, "1{Enter}");
    await expect(thumb).toHaveValue("10");
  },
};

export const InputControlled: Story = {
  args: { showInput: true, value: 40, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const input = canvas.getByRole("textbox", { name: "Volume" });
    await userEvent.clear(input);
    await userEvent.type(input, "60{Enter}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      60,
      expect.anything(),
    );
    await expect(thumb).toHaveValue("40");
    await expect(input).toHaveValue("40");
  },
};

export const InputReadOnly: Story = {
  args: {
    showInput: true,
    inputReadOnly: true,
    step: 5,
    onValueChange: fn(),
    onValueCommitted: fn(),
  },
  play: async ({ args, canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    const input = canvas.getByRole("textbox", { name: "Volume" });
    await expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "7{Enter}");
    await expect(input).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveValue("45");
  },
};

export const InputDisabled: Story = {
  args: { showInput: true, disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Volume" }),
    ).toBeDisabled();
  },
};

export const InputInvalid: Story = {
  args: { showInput: true, "aria-invalid": true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Volume" }),
    ).toHaveAttribute("aria-invalid", "true");
  },
};

export const InputWithoutShowInput: Story = {
  args: { inputReadOnly: true, inputAriaLabel: "Unused" },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("textbox")).toBeNull();
  },
};

export const InputInField: Story = {
  args: {
    "aria-label": undefined,
    showInput: true,
    inputAriaLabel: "Brightness value",
  },
  render: (args) => (
    <Field>
      <FieldLabel>Brightness</FieldLabel>
      <Slider {...args} />
    </Field>
  ),
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Brightness" });
    const input = canvas.getByRole("textbox", { name: "Brightness value" });
    await userEvent.click(canvas.getByText("Brightness"));
    await expect(thumb).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "55{Enter}");
    await expect(thumb).toHaveValue("55");
  },
};

export const InputDecimalMax: Story = {
  args: {
    showInput: true,
    min: 0,
    max: 0.3,
    step: 0.1,
    defaultValue: 0.1,
    "aria-label": "Ratio",
  },
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole("slider", { name: "Ratio" });
    const input = canvas.getByRole("textbox", { name: "Ratio" });
    await userEvent.clear(input);
    await userEvent.type(input, "0.3{Enter}");
    await expect(thumb).toHaveValue("0.3");
    await userEvent.clear(input);
    await userEvent.type(input, "5{Enter}");
    await expect(thumb).toHaveValue("0.3");
    await userEvent.clear(input);
    await userEvent.type(input, "0.2{Enter}");
    await expect(thumb).toHaveValue("0.2");
  },
};

export const InputTinyStep: Story = {
  args: {
    showInput: true,
    min: 0,
    max: 0.000001,
    step: 0.0000001,
    defaultValue: 0,
    "aria-label": "Tiny",
  },
  /* axe rejects the exponent-form `aria-valuenow` Base UI writes on the thumb. */
  parameters: { a11y: { test: "off" } },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Tiny" });
    await userEvent.clear(input);
    await userEvent.type(input, "0.0000005{Enter}");
    if (!(input instanceof HTMLInputElement)) throw new Error("not an input");
    await expect(Number(input.value)).toBe(0.0000005);
  },
};

export const InputNamedByLabelledby: Story = {
  args: { "aria-label": undefined, showInput: true },
  render: (args) => (
    <div>
      <span id="speed-label">Speed</span>
      <Slider {...args} aria-labelledby="speed-label" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Speed" }),
    ).toBeInTheDocument();
  },
};

export const InputEscapeStaysInside: Story = {
  args: { showInput: true },
  render: (args) => (
    <div data-testid="outer">
      <Slider {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Volume" });
    let escapes = 0;
    /* React handles keys at the root, so only a listener above it (as a dialog's
     * dismiss has) shows whether the keydown stopped there. */
    const count = (event: KeyboardEvent) => {
      if (event.key === "Escape") escapes += 1;
    };
    document.addEventListener("keydown", count);
    await userEvent.type(input, "7{Escape}");
    await expect(input).toHaveValue("40");
    await expect(escapes).toBe(0);
    await userEvent.keyboard("{Escape}");
    document.removeEventListener("keydown", count);
    await expect(escapes).toBe(1);
  },
};

export const InputInFormField: Story = {
  args: {
    "aria-label": undefined,
    showInput: true,
    inputAriaLabel: "Level value",
    name: "level",
  },
  render: (args) => (
    <form data-testid="form">
      <Field name="level">
        <FieldLabel>Level</FieldLabel>
        <Slider {...args} />
      </Field>
    </form>
  ),
  play: async ({ canvas }) => {
    const form = canvas.getByTestId("form");
    if (!(form instanceof HTMLFormElement)) throw new Error("form missing");
    const input = canvas.getByRole("textbox", { name: "Level value" });
    await userEvent.clear(input);
    await userEvent.type(input, "65{Enter}");
    await expect(new FormData(form).getAll("level")).toEqual(["65"]);
    const ids = [...form.querySelectorAll("[id]")].map((el) => el.id);
    await expect(new Set(ids).size).toBe(ids.length);
  },
};

export const InputInDisabledField: Story = {
  args: { "aria-label": undefined, showInput: true, inputAriaLabel: "Value" },
  render: (args) => (
    <Field disabled>
      <FieldLabel>Level</FieldLabel>
      <Slider {...args} />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Value" })).toBeDisabled();
  },
};

export const InputDescribedInField: Story = {
  args: { "aria-label": undefined, showInput: true, inputAriaLabel: "Value" },
  render: (args) => (
    <Field error="Pick a level above zero.">
      <FieldLabel>Level</FieldLabel>
      <Slider {...args} />
      <FieldHint>Applies to every panel.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Value" });
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining("Applies to every panel."),
    );
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

export const InputIgnoresKeysDuringComposition: Story = {
  args: { showInput: true, onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Volume" });
    await userEvent.clear(input);
    await userEvent.type(input, "70");
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        isComposing: true,
        bubbles: true,
      }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 229,
        bubbles: true,
      }),
    );
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(input).toHaveValue("70");
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const InputCommitsOnceWhenCallbackMovesFocus: Story = {
  args: {
    showInput: true,
    onValueChange: fn(),
    onValueCommitted: fn(() => {
      document.getElementById("next-field")?.focus();
    }),
  },
  render: (args) => (
    <div>
      <Slider {...args} />
      <button id="next-field" type="button">
        Next
      </button>
    </div>
  ),
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Volume" });
    await userEvent.clear(input);
    await userEvent.type(input, "65{Enter}");
    await expect(canvas.getByRole("slider")).toHaveValue("65");
    await expect(canvas.getByRole("button", { name: "Next" })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};
