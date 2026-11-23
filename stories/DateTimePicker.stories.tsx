import {
  DateTimePicker,
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useState } from "react";
import {
  expect,
  fn,
  type Mock,
  screen,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import { expectVisible } from "./visible";

type PickerArgs = Omit<
  ComponentProps<typeof DateTimePicker>,
  "value" | "onValueChange"
> & {
  initial: string;
  onValueChange: (value: string) => void;
};

function Harness({ initial, onValueChange, ...rest }: PickerArgs) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex flex-col items-start gap-8">
      <DateTimePicker
        {...rest}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
      />
      <p className="text-ink text-base">Elsewhere on the page</p>
    </div>
  );
}

const meta = {
  title: "Controls/DateTimePicker",
  component: Harness,
  args: {
    initial: "2030-06-15T09:30",
    onValueChange: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = Parameters<NonNullable<Story["play"]>>[0]["canvas"];

const expectOnce = async (mock: Mock, ...expected: unknown[]) => {
  await expect(mock).toHaveBeenCalledTimes(1);
  await expect(mock).toHaveBeenCalledWith(...expected);
};

const openPicker = async (canvas: Canvas, name: string) => {
  await userEvent.click(canvas.getByRole("button", { name }));
  return expectVisible(() =>
    screen.findByRole("dialog", { name: "Select date and time" }),
  );
};

export const Default: Story = {};

export const Empty: Story = {
  args: { initial: "" },
};

export const AppliesTheTypedValue: Story = {
  args: { initial: "" },
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "Select date and time");
    await userEvent.type(
      screen.getByRole("textbox", { name: "Date" }),
      "2030-07-04",
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "7");
    await userEvent.type(screen.getByRole("textbox", { name: "Minute" }), "5");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onValueChange, "2030-07-04T07:05");
    await expectOnce(args.onClose, {
      outcome: "applied",
      value: "2030-07-04T07:05",
    });
  },
};

export const ApplyingAnUnchangedValueStillCloses: Story = {
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expectOnce(args.onClose, {
      outcome: "applied",
      value: "2030-06-15T09:30",
    });
  },
};

export const CancelDismisses: Story = {
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await userEvent.clear(screen.getByRole("textbox", { name: "Hour" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "11");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expectOnce(args.onClose, {
      outcome: "dismissed",
    });
    await expect(
      canvas.getByRole("button", { name: "2030-06-15 09:30" }),
    ).toHaveFocus();
  },
};

export const EscapeDismisses: Story = {
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onClose, {
      outcome: "dismissed",
    });
  },
};

export const OutsidePressDismisses: Story = {
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await userEvent.click(canvas.getByText("Elsewhere on the page"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onClose, {
      outcome: "dismissed",
    });
  },
};

export const MinBlocksEarlierValues: Story = {
  args: { initial: "2030-06-15T09:30", min: "2030-06-10T10:00" },
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const apply = screen.getByRole("button", { name: "Apply" });
    await expect(apply).toBeEnabled();

    const earlierDay = screen.getByRole("gridcell", {
      name: "Sunday, June 9, 2030",
    });
    await expect(earlierDay).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(earlierDay);
    await expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue(
      "2030-06-15",
    );

    const date = screen.getByRole("textbox", { name: "Date" });
    await userEvent.clear(date);
    await userEvent.type(date, "2030-06-10");
    await userEvent.clear(screen.getByRole("textbox", { name: "Hour" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "9");
    await expect(apply).toBeDisabled();
    await expect(screen.getByRole("alert")).toBeVisible();

    await userEvent.clear(screen.getByRole("textbox", { name: "Hour" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "10");
    await userEvent.clear(screen.getByRole("textbox", { name: "Minute" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Minute" }), "0");
    await expect(apply).toBeEnabled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const InvalidTextBlocksApply: Story = {
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const date = screen.getByRole("textbox", { name: "Date" });
    await userEvent.clear(date);
    await userEvent.type(date, "2030-02-30");
    await expect(date).toHaveAttribute("aria-invalid", "true");
    await expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    await userEvent.clear(date);
    await userEvent.type(date, "2030-02-28");
    await expect(date).not.toHaveAttribute("aria-invalid");
    await expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
  },
};

export const CalendarKeyboard: Story = {
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const cell = (name: string) => screen.getByRole("gridcell", { name });
    await waitFor(() => expect(cell("Saturday, June 15, 2030")).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await expect(cell("Sunday, June 16, 2030")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(cell("Sunday, June 23, 2030")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(cell("Sunday, June 23, 2030")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(cell("Saturday, June 29, 2030")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(cell("Sunday, June 30, 2030")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(cell("Monday, July 1, 2030")).toHaveFocus();
    await expect(screen.getByText("July 2030")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    await userEvent.keyboard("{PageDown}");
    await expect(cell("Thursday, August 1, 2030")).toHaveFocus();
    await userEvent.keyboard("{PageUp}{PageUp}");
    await expect(cell("Saturday, June 1, 2030")).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue(
      "2030-06-01",
    );
    await expect(screen.getByRole("dialog")).toBeVisible();
  },
};

export const PageKeysClampTheDay: Story = {
  args: { initial: "2030-01-31T09:30" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-01-31 09:30");
    await userEvent.keyboard("{PageDown}");
    await expect(
      screen.getByRole("gridcell", { name: "Thursday, February 28, 2030" }),
    ).toHaveFocus();
  },
};

function InsideNativeDialog(props: PickerArgs) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  return (
    <div>
      <button
        type="button"
        className="text-ink"
        onClick={() => {
          dialog?.showModal();
        }}
      >
        Open the form
      </button>
      <dialog ref={setDialog} aria-label="Entry form" className="text-ink p-6">
        <Harness {...props} portalContainer={dialog} />
        <form method="dialog">
          <button type="submit">Close the form</button>
        </form>
      </dialog>
    </div>
  );
}

export const InsideAModalDialog: Story = {
  render: (args) => <InsideNativeDialog {...args} />,
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open the form" }),
    );
    const form = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Entry form" }),
    );
    await userEvent.click(
      within(form).getByRole("button", { name: "2030-06-15 09:30" }),
    );
    const picker = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    await expect(form).toContainElement(picker);
    await userEvent.click(
      within(picker).getByRole("gridcell", { name: "Monday, June 17, 2030" }),
    );
    await userEvent.click(
      within(picker).getByRole("button", { name: "Apply" }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select date and time" }),
      ).toBeNull(),
    );
    await expectOnce(args.onValueChange, "2030-06-17T09:30");
    await expect(form).toBeVisible();
  },
};

export const EscapeInsideAModalDialogDismissesThePicker: Story = {
  render: (args) => <InsideNativeDialog {...args} />,
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open the form" }),
    );
    const form = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Entry form" }),
    );
    await userEvent.click(
      within(form).getByRole("button", { name: "2030-06-15 09:30" }),
    );
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select date and time" }),
      ).toBeNull(),
    );
    await expectOnce(args.onClose, {
      outcome: "dismissed",
    });
  },
};

export const NullPortalContainerUsesTheDefaultPlacement: Story = {
  args: { portalContainer: null },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
  },
};

export const TriggerPressDismisses: Story = {
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await userEvent.click(
      canvas.getByRole("button", { name: "2030-06-15 09:30" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onClose, { outcome: "dismissed" });
  },
};

export const KeysBeforeMinAreRejected: Story = {
  args: { min: "2030-06-10T10:00" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const earlier = screen.getByRole("gridcell", {
      name: "Sunday, June 9, 2030",
    });
    earlier.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue(
      "2030-06-15",
    );
  },
};

export const MonthButtonKeepsFocusAfterAKeyThatDoesNotMove: Story = {
  args: { initial: "2030-06-16T09:30" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-16 09:30");
    await waitFor(() =>
      expect(
        screen.getByRole("gridcell", { name: "Sunday, June 16, 2030" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{Home}");
    const next = screen.getByRole("button", { name: "Next month" });
    await userEvent.click(next);
    await expect(screen.getByText("July 2030")).toBeVisible();
    await expect(next).toHaveFocus();
  },
};

export const ClosingTheModalDialogDismisses: Story = {
  render: (args) => <InsideNativeDialog {...args} />,
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open the form" }),
    );
    const form = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Entry form" }),
    );
    await userEvent.click(
      within(form).getByRole("button", { name: "2030-06-15 09:30" }),
    );
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    if (!(form instanceof HTMLDialogElement)) throw new Error("not a dialog");
    form.close();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
    await expect(args.onClose).toHaveBeenCalledWith({ outcome: "dismissed" });
  },
};

const closedWith: string[] = [];

function RenamingParent({ onClose, ...props }: PickerArgs) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [label, setLabel] = useState("first");
  return (
    <div>
      <button
        type="button"
        className="text-ink"
        onClick={() => {
          dialog?.showModal();
        }}
      >
        Open the form
      </button>
      <dialog ref={setDialog} aria-label="Entry form" className="text-ink p-6">
        <div
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === "b") setLabel("second");
          }}
        >
          <Harness
            {...props}
            portalContainer={dialog}
            onClose={(close) => {
              closedWith.push(label);
              onClose(close);
            }}
          />
        </div>
      </dialog>
    </div>
  );
}

export const ClosingTheDialogReportsToTheLatestOnClose: Story = {
  render: (args) => <RenamingParent {...args} />,
  play: async ({ args, canvas }) => {
    closedWith.length = 0;
    await userEvent.click(
      canvas.getByRole("button", { name: "Open the form" }),
    );
    const form = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Entry form" }),
    );
    await userEvent.click(
      within(form).getByRole("button", { name: "2030-06-15 09:30" }),
    );
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    await userEvent.keyboard("b");
    if (!(form instanceof HTMLDialogElement)) throw new Error("not a dialog");
    form.close();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
    await expect(closedWith.at(-1)).toBe("second");
  },
};

export const RequestingCloseOfTheModalDialogDismisses: Story = {
  render: (args) => <InsideNativeDialog {...args} />,
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open the form" }),
    );
    const form = await expectVisible(() =>
      screen.findByRole("dialog", { name: "Entry form" }),
    );
    await userEvent.click(
      within(form).getByRole("button", { name: "2030-06-15 09:30" }),
    );
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    if (!(form instanceof HTMLDialogElement)) throw new Error("not a dialog");
    form.requestClose();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
    await expect(args.onClose).toHaveBeenCalledWith({ outcome: "dismissed" });
    await expect(form).not.toBeVisible();
  },
};

const FieldHarness = ({ disabled = false, ...args }: PickerArgs) => (
  <Field disabled={disabled} error="Start is required">
    <FieldLabel>Start</FieldLabel>
    <Harness {...args} />
    <FieldHint>Local time</FieldHint>
    <FieldError />
  </Field>
);

export const InsideAField: Story = {
  render: (args) => <FieldHarness {...args} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Start 2030-06-15 09:30",
    });
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
    await expect(trigger).toHaveAccessibleDescription(/Local time/);
    await expect(trigger).toHaveAccessibleDescription(/Start is required/);
    await userEvent.click(trigger);
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    const inputs = ["Date", "Hour", "Minute"].map((name) =>
      screen.getByRole("textbox", { name }),
    );
    for (const input of inputs) {
      await expect(input).not.toHaveAttribute("aria-describedby");
      await expect(input).not.toHaveAttribute("aria-invalid");
    }
    const ids = inputs.map((input) => input.id).filter(Boolean);
    await expect(new Set(ids).size).toBe(ids.length);
  },
};

export const AFieldLabelActivatesTheTrigger: Story = {
  render: (args) => <FieldHarness {...args} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Start 2030-06-15 09:30",
    });
    await userEvent.click(canvas.getByText("Start"));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
  },
};

export const ADisabledFieldDisablesTheTrigger: Story = {
  render: (args) => <FieldHarness {...args} disabled />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Start 2030-06-15 09:30",
    });
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(screen.queryByRole("dialog")).toBeNull();
  },
};

export const TheTimeRowStaysInsideThePopover: Story = {
  play: async ({ canvas }) => {
    const popup = await openPicker(canvas, "2030-06-15 09:30");
    const hour = screen.getByRole("textbox", { name: "Hour" });
    const minute = screen.getByRole("textbox", { name: "Minute" });
    await userEvent.clear(hour);
    await userEvent.type(hour, "88");
    await userEvent.clear(minute);
    await userEvent.type(minute, "88");
    const row = hour.parentElement;
    if (row === null) throw new Error("the time row is missing");
    const inside = popup.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    await expect(rowBox.left).toBeGreaterThanOrEqual(inside.left);
    await expect(rowBox.right).toBeLessThanOrEqual(inside.right);
    for (const input of [hour, minute]) {
      const box = input.getBoundingClientRect();
      await expect(box.right).toBeLessThanOrEqual(inside.right);
      await expect(input.scrollWidth).toBeLessThanOrEqual(input.clientWidth);
    }
  },
};
