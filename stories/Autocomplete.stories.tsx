import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  ComboboxContent,
  ComboboxList,
  Field,
  FieldHint,
  FieldLabel,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectStateBorders } from "./border-color";
import { expectInsideInsets, withInsets } from "./safe-area";

const ITEMS = ["Daily", "Weekly", "Monthly"];

const isCoarse = () => matchMedia("(any-pointer: coarse)").matches;

const options = () => screen.getAllByRole("option").map((o) => o.textContent);

const meta = {
  title: "Forms/Autocomplete",
  component: Autocomplete,
  args: { items: ITEMS },
  render: (args) => (
    <Autocomplete {...args}>
      <AutocompleteInput aria-label="Repeat" placeholder="Type a cadence" />
      <ComboboxContent>
        <ComboboxList>
          {(item: string) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Autocomplete>
  ),
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtering: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "wee");
    await waitFor(() => expect(options()).toEqual(["Weekly"]));
    await userEvent.clear(input);
    await userEvent.type(input, "MON");
    await waitFor(() => expect(options()).toEqual(["Monthly"]));
    await userEvent.clear(input);
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(options()).toEqual(ITEMS));
  },
};

export const KeepsUnmatchedText: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "xyz");
    await waitFor(() =>
      expect(screen.queryAllByRole("option")).toHaveLength(0),
    );
    const popup = document.querySelector("[role=listbox]")?.parentElement;
    if (!popup) throw new Error("no popup");
    await expect(getComputedStyle(popup).display).toBe("none");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(document.body);
    await expect(input).toHaveValue("xyz");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "xyz",
      expect.anything(),
    );
  },
};

export const Choosing: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "w");
    await userEvent.click(
      await screen.findByRole("option", { name: "Weekly" }),
    );
    await waitFor(() => expect(input).toHaveValue("Weekly"));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "Weekly",
      expect.anything(),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

export const Keyboard: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    input.focus();
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(input.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
    await userEvent.keyboard("{ArrowDown}");
    const daily = screen.getByRole("option", { name: "Daily" });
    await waitFor(() => expect(daily).toHaveAttribute("data-highlighted"));
    await waitFor(() =>
      expect(input).toHaveAttribute("aria-activedescendant", daily.id),
    );
    await userEvent.keyboard("{ArrowDown}");
    const weekly = screen.getByRole("option", { name: "Weekly" });
    await waitFor(() => expect(weekly).toHaveAttribute("data-highlighted"));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(input).toHaveValue("Weekly"));
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "mo");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toHaveValue("mo");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("");
  },
};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expect(await screen.findByRole("listbox")).toBeVisible();
    await expect(screen.getAllByRole("option")).toHaveLength(3);
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
      <Autocomplete {...args}>
        <AutocompleteInput aria-label="Default" placeholder="Type" />
      </Autocomplete>
      <Autocomplete {...args}>
        <AutocompleteInput
          aria-label="Invalid"
          aria-invalid="true"
          placeholder="Type"
        />
      </Autocomplete>
      <Autocomplete {...args} disabled>
        <AutocompleteInput aria-label="Disabled" placeholder="Type" />
      </Autocomplete>
      <Autocomplete {...args} disabled>
        <AutocompleteInput
          aria-label="Disabled and invalid"
          aria-invalid="true"
          placeholder="Type"
        />
      </Autocomplete>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Daily" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    await expect(input).toBeDisabled();
    await userEvent.type(input, "x");
    await expect(input).toHaveValue("Daily");
    await expect(screen.queryByRole("listbox")).toBeNull();
  },
};

export const InField: Story = {
  render: (args) => (
    <Field error="Enter a cadence.">
      <FieldLabel>Repeat</FieldLabel>
      <Autocomplete {...args}>
        <AutocompleteInput placeholder="Type a cadence" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Autocomplete>
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
      <Autocomplete {...args}>
        <AutocompleteInput aria-label="Repeat" placeholder="Type a cadence" />
        <ComboboxContent>
          <ComboboxList>
            <AutocompleteItem value="long">
              averyveryveryveryveryveryveryveryveryveryveryveryverylongunbrokenword
            </AutocompleteItem>
          </ComboboxList>
        </ComboboxContent>
      </Autocomplete>
    </div>
  ),
  args: {
    items: [
      "averyveryveryveryveryveryveryveryveryveryveryveryverylongunbrokenword",
    ],
  },
  play: async ({ canvas }) => {
    await withInsets(async () => {
      await userEvent.type(canvas.getByRole("combobox"), "a");
      await expectInsideInsets(await screen.findByRole("listbox"));
    });
  },
});

export const InsideSafeAreaAtTheLeftEdge: Story = insideSafeArea("left-0");

export const InsideSafeAreaAtTheRightEdge: Story = insideSafeArea("right-0");
