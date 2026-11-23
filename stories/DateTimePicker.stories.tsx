import {
  Button,
  DateTimePicker,
  type DateTimePickerLabels,
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

import { expectInsideInsets, withInsets } from "./safe-area";
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
      <p className="text-ink text-ds-base">Elsewhere on the page</p>
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

const openPicker = async (
  canvas: Canvas,
  name: string,
  dialogName = "Select date and time",
) => {
  await userEvent.click(canvas.getByRole("button", { name }));
  return expectVisible(() => screen.findByRole("dialog", { name: dialogName }));
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
      <Button
        variant="secondary"
        onClick={() => {
          dialog?.showModal();
        }}
      >
        Open the form
      </Button>
      <dialog ref={setDialog} aria-label="Entry form" className="text-ink p-6">
        <Harness {...props} portalContainer={dialog} />
        <form method="dialog">
          <Button type="submit" variant="secondary">
            Close the form
          </Button>
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
      <Button
        variant="secondary"
        onClick={() => {
          dialog?.showModal();
        }}
      >
        Open the form
      </Button>
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

export const AnExplicitLabelledByKeepsTheValueInTheName: Story = {
  render: (args) => (
    <>
      <span id="start-label">Start</span>
      <Harness {...args} aria-labelledby="start-label" />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Start 2030-06-15 09:30" }),
    ).toBeVisible();
  },
};

export const AFieldLabelClickedWhileOpenClosesThePicker: Story = {
  render: (args) => <FieldHarness {...args} />,
  play: async ({ args, canvas }) => {
    await openPicker(canvas, "Start 2030-06-15 09:30");
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "1");
    await userEvent.click(canvas.getByText("Start"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onClose, { outcome: "dismissed" });
  },
};

export const ATriggerInsideItsLabelStillClosesOnItsOwnClick: Story = {
  render: (args) => (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- the control is Harness's trigger
    <label>
      Start <Harness {...args} />
    </label>
  ),
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expectVisible(() =>
      screen.findByRole("dialog", { name: "Select date and time" }),
    );
    await userEvent.click(canvas.getByRole("button"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectOnce(args.onClose, { outcome: "dismissed" });
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

const insideSafeArea = (placement: string): Story => ({
  render: (args) => (
    <div className={`fixed w-40 [&_button]:w-full ${placement}`}>
      <Harness {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await withInsets(async () => {
      await expectInsideInsets(await openPicker(canvas, "2030-06-15 09:30"));
    });
  },
});

export const InsideSafeAreaAtTheTopEdge: Story = insideSafeArea("top-0 left-0");

export const InsideSafeAreaAtTheBottomEdge: Story =
  insideSafeArea("right-0 bottom-0");

const JAPANESE_LABELS = {
  title: "日付と時刻を選択",
  date: "日付",
  hour: "時",
  minute: "分",
  previousMonth: "前の月",
  nextMonth: "次の月",
  cancel: "キャンセル",
  apply: "適用",
  beforeMin: (min: string) => `${min} 以降の日時を選んでください。`,
};

export const Japanese: Story = {
  args: {
    locale: "ja",
    labels: JAPANESE_LABELS,
    min: "2030-06-10T00:00",
  },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30", "日付と時刻を選択");
    await expect(screen.getByText("2030年6月")).toBeVisible();
    await expect(
      screen.getAllByRole("columnheader").map((header) => header.ariaLabel),
    ).toEqual([
      "日曜日",
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
    ]);
    await expect(
      screen.getByRole("gridcell", { name: "2030年6月15日土曜日" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(screen.getByRole("textbox", { name: "日付" })).toBeVisible();
    await expect(screen.getByRole("textbox", { name: "時" })).toBeVisible();
    await expect(screen.getByRole("textbox", { name: "分" })).toBeVisible();
    await expect(screen.getByRole("button", { name: "前の月" })).toBeVisible();
    await expect(screen.getByRole("button", { name: "次の月" })).toBeVisible();
    await expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeVisible();
    await expect(screen.getByRole("button", { name: "適用" })).toBeEnabled();
    await userEvent.clear(screen.getByRole("textbox", { name: "日付" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "日付" }),
      "2030-06-01",
    );
    await expect(
      screen.getByText("2030-06-10 00:00 以降の日時を選んでください。"),
    ).toBeVisible();
  },
};

export const OmittedLabelsKeepTheirEnglishDefaults: Story = {
  args: { locale: "ja", labels: { apply: "適用" } },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(screen.getByRole("button", { name: "適用" })).toBeVisible();
    await expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
  },
};

export const AMalformedLocaleFallsBackToEnglish: Story = {
  args: { locale: "not a tag!" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(screen.getByText("June 2030")).toBeVisible();
    await expect(
      screen.getByRole("gridcell", { name: "Saturday, June 15, 2030" }),
    ).toBeVisible();
  },
};

export const FirstDayOfWeekIsSettable: Story = {
  args: { firstDayOfWeek: 1 },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const headers = screen.getAllByRole("columnheader");
    await expect(headers[0]).toHaveAccessibleName("Monday");
    await expect(headers[6]).toHaveAccessibleName("Sunday");
    const cell = (name: string) => screen.getByRole("gridcell", { name });
    await waitFor(() => expect(cell("Saturday, June 15, 2030")).toHaveFocus());
    await userEvent.keyboard("{Home}");
    await expect(cell("Monday, June 10, 2030")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(cell("Sunday, June 16, 2030")).toHaveFocus();
  },
};

export const FirstDayOfWeekFollowsTheLocale: Story = {
  args: { locale: "en-GB" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(screen.getAllByRole("columnheader")[0]).toHaveAccessibleName(
      "Monday",
    );
  },
};

const headerTexts = () =>
  screen.getAllByRole("columnheader").map((header) => header.textContent);

export const EnglishHeadersAreTwoLetterAbbreviations: Story = {
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(headerTexts()).toEqual([
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
    ]);
  },
};

export const HeadersStayDistinctWhenShortNamesShareAPrefix: Story = {
  args: { locale: "pt" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(new Set(headerTexts()).size).toBe(7);
  },
};

export const NamesFollowTheGregorianGridInACalendarOfAnotherLocale: Story = {
  args: { locale: "fa" },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "2030-06-15 09:30" }),
    );
    const cell = await screen.findByRole("gridcell", {
      name: new Intl.DateTimeFormat("fa", {
        dateStyle: "full",
        calendar: "gregory",
        numberingSystem: "latn",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(2030, 5, 15))),
    });
    await expect(cell).toHaveAttribute("aria-selected", "true");
  },
};

export const AnUnsupportedLocaleFallsBackToEnglish: Story = {
  args: { locale: "xx" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(screen.getByText("June 2030")).toBeVisible();
    await expect(screen.getAllByRole("columnheader")[0]).toHaveAccessibleName(
      "Sunday",
    );
  },
};

const withMissingTranslation = () => {
  const labels: Partial<DateTimePickerLabels> = {};
  Reflect.set(labels, "apply", undefined);
  Reflect.set(labels, "beforeMin", undefined);
  return labels;
};

export const AnUndefinedLabelKeepsItsEnglishDefault: Story = {
  args: { labels: withMissingTranslation(), min: "2030-06-10T00:00" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    await expect(screen.getByRole("button", { name: "Apply" })).toBeVisible();
    await userEvent.clear(screen.getByRole("textbox", { name: "Date" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Date" }),
      "2030-06-01",
    );
    await expect(
      screen.getByText("Choose a time on or after 2030-06-10 00:00."),
    ).toBeVisible();
  },
};

export const CellNamesCarryTheVisibleDayInTheLocalesOtherDigits: Story = {
  args: { locale: "fa" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    for (const cell of screen.getAllByRole("gridcell")) {
      const visible = cell.textContent;
      if (visible) await expect(cell.ariaLabel).toContain(visible);
    }
  },
};

export const WeekdayHeadersFitTheirColumns: Story = {
  args: { locale: "lv" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    for (const header of screen.getAllByRole("columnheader")) {
      await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    }
  },
};

export const AHeaderWithNoShortFormThatSeparatesTheDaysStillFits: Story = {
  args: { locale: "sw" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    for (const header of screen.getAllByRole("columnheader")) {
      await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    }
  },
};

export const AWrappedHeaderNeverWidensTheGridPastThePopup: Story = {
  args: { locale: "sw" },
  play: async ({ canvas }) => {
    const dialog = await openPicker(canvas, "2030-06-15 09:30");
    const grid = screen.getByRole("grid");
    await expect(grid.getBoundingClientRect().right).toBeLessThanOrEqual(
      dialog.getBoundingClientRect().right,
    );
  },
};

export const NarrowFormsSeparateTheDaysWhenPrefixesCannot: Story = {
  args: { locale: "he" },
  play: async ({ canvas }) => {
    await openPicker(canvas, "2030-06-15 09:30");
    const narrow = new Intl.DateTimeFormat("he", {
      weekday: "narrow",
      calendar: "gregory",
      timeZone: "UTC",
    });
    await expect(headerTexts()).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((day) =>
        narrow.format(new Date(Date.UTC(2023, 0, day))),
      ),
    );
  },
};
