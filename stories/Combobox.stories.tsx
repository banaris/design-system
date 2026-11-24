import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldHint,
  FieldLabel,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectStateBorders } from "./border-color";
import { expectInsideInsets, withInsets } from "./safe-area";

const ITEMS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const isCoarse = () => matchMedia("(any-pointer: coarse)").matches;

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  args: { items: ITEMS },
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput aria-label="Repeat" placeholder="Choose a cadence" />
      <ComboboxContent>
        <ComboboxEmpty>No cadence matches.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof ITEMS)[number]) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { defaultValue: ITEMS[1] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("combobox")).toHaveValue("Weekly");
  },
};

export const Filtering: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "wee");
    await waitFor(() =>
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
        "Weekly",
      ]),
    );
    await userEvent.clear(input);
    await userEvent.type(input, "MON");
    await waitFor(() =>
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
        "Monthly",
      ]),
    );
  },
};

export const NoMatch: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "xyz");
    await expect(await screen.findByText("No cadence matches.")).toBeVisible();
    await expect(screen.queryAllByRole("option")).toHaveLength(0);
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Choosing: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.click(
      await screen.findByRole("option", { name: "Monthly" }),
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ITEMS[2],
      expect.anything(),
    );
    await waitFor(() => expect(input).toHaveValue("Monthly"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

export const Keyboard: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("combobox");
    input.focus();
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(input.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
    const daily = screen.getByRole("option", { name: "Daily" });
    await waitFor(() => expect(daily).toHaveAttribute("data-highlighted"));
    await waitFor(() =>
      expect(input).toHaveAttribute("aria-activedescendant", daily.id),
    );
    await userEvent.keyboard("{ArrowDown}");
    const weekly = screen.getByRole("option", { name: "Weekly" });
    await waitFor(() => expect(weekly).toHaveAttribute("data-highlighted"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ITEMS[1],
      expect.anything(),
    );
    await waitFor(() => expect(input).toHaveValue("Weekly"));
  },
};

export const EscapeCloses: Story = {
  args: { defaultValue: ITEMS[0] },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toHaveValue("Daily");
  },
};

export const DropsUnselectedText: Story = {
  args: { defaultValue: ITEMS[0] },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "x");
    await expect(input).toHaveValue("Dailyx");
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await waitFor(() => expect(input).toHaveValue("Daily"));
  },
};

export const Open: Story = {
  args: { defaultOpen: true, defaultValue: ITEMS[0] },
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
      <Combobox {...args}>
        <ComboboxInput aria-label="Default" placeholder="Choose" />
      </Combobox>
      <Combobox {...args}>
        <ComboboxInput
          aria-label="Invalid"
          aria-invalid="true"
          placeholder="Choose"
        />
      </Combobox>
      <Combobox {...args} disabled>
        <ComboboxInput aria-label="Disabled" placeholder="Choose" />
      </Combobox>
      <Combobox {...args} disabled>
        <ComboboxInput
          aria-label="Disabled and invalid"
          aria-invalid="true"
          placeholder="Choose"
        />
      </Combobox>
    </div>
  ),
};

export const InField: Story = {
  render: (args) => (
    <Field error="Pick a cadence.">
      <FieldLabel>Repeat</FieldLabel>
      <Combobox {...args}>
        <ComboboxInput placeholder="Choose a cadence" />
        <ComboboxContent>
          <ComboboxList>
            {(item: (typeof ITEMS)[number]) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldHint>Applies to new entries.</FieldHint>
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Repeat" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Applies to new entries.");
    await userEvent.click(canvas.getByText("Repeat"));
    await expect(input).toHaveFocus();
  },
};

export const TouchTargets: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    const floor = isCoarse() ? 44 : 0;
    const input = canvas.getByRole("combobox");
    await screen.findByRole("listbox");
    for (const control of [input, ...screen.getAllByRole("option")]) {
      await expect(
        control.getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(floor);
    }
    await expect(Number.parseFloat(getComputedStyle(input).fontSize)).toBe(
      isCoarse() ? 16 : 14,
    );
  },
};

const insideSafeArea = (edge: "left-0" | "right-0"): Story => ({
  render: (args) => (
    <div className={`fixed top-1/2 ${edge} w-48`}>
      <Combobox {...args}>
        <ComboboxInput aria-label="Repeat" placeholder="Choose a cadence" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value={{ value: "long", label: "long" }}>
              averyveryveryveryveryveryveryveryveryveryveryveryverylongunbrokenword
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
  play: async ({ canvas }) => {
    await withInsets(async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      await expectInsideInsets(await screen.findByRole("listbox"));
    });
  },
});

export const InsideSafeAreaAtTheLeftEdge: Story = insideSafeArea("left-0");

export const InsideSafeAreaAtTheRightEdge: Story = insideSafeArea("right-0");
