import {
  Button,
  DateTimePicker,
  Field,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  TextField,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type SubmitEvent, useState } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

const CADENCES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function HabitForm() {
  const [starts, setStarts] = useState("");
  const [submitted, setSubmitted] = useState("");
  return (
    <form
      className="flex max-w-sm flex-col gap-4"
      data-testid="form"
      onSubmit={(event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(
          JSON.stringify(
            Object.fromEntries(new FormData(event.currentTarget).entries()),
          ),
        );
      }}
    >
      <Field name="title" validationMode="onBlur">
        <FieldLabel>Habit name</FieldLabel>
        <TextField required />
        <FieldError />
      </Field>
      <Field name="cadence">
        <FieldLabel>Cadence</FieldLabel>
        <Select items={CADENCES} defaultValue="daily">
          <SelectTrigger />
          <SelectContent>
            {CADENCES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Starts</FieldLabel>
        <DateTimePicker
          name="starts"
          required
          value={starts}
          onValueChange={setStarts}
          onClose={() => undefined}
        />
      </Field>
      <Fieldset>
        <FieldsetLegend>Reminder</FieldsetLegend>
        <RadioGroup name="reminder" defaultValue="none">
          {["none", "morning"].map((value) => (
            <label
              key={value}
              className="text-ink text-ds-base flex items-center gap-2"
            >
              <Radio value={value} />
              {value}
            </label>
          ))}
        </RadioGroup>
      </Fieldset>
      <Button type="submit">Save</Button>
      <output
        data-testid="submitted"
        className="text-small text-ink wrap-anywhere"
      >
        {submitted}
      </output>
    </form>
  );
}

const meta = {
  title: "Recipes/Form",
  component: HabitForm,
} satisfies Meta<typeof HabitForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SubmitsThroughFormData: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByTestId("submitted")).toBeEmptyDOMElement();
    const title = canvas.getByRole("textbox", { name: "Habit name" });
    await userEvent.type(title, "x");
    await userEvent.clear(title);
    await userEvent.tab();
    await expect(await canvas.findByRole("alert")).toBeVisible();

    await userEvent.type(
      canvas.getByRole("textbox", { name: "Habit name" }),
      "Stretch",
    );
    await userEvent.click(canvas.getByRole("button", { name: /Starts/ }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Date" }),
      "2030-07-04",
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Hour" }), "7");
    await userEvent.type(screen.getByRole("textbox", { name: "Minute" }), "5");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await userEvent.click(canvas.getByRole("radio", { name: "morning" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(canvas.getByTestId("submitted")).not.toBeEmptyDOMElement(),
    );
    await expect(
      JSON.parse(canvas.getByTestId("submitted").textContent),
    ).toMatchObject({
      title: "Stretch",
      cadence: "daily",
      starts: "2030-07-04T07:05",
      reminder: "morning",
    });
  },
};
