import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Surfaces/Accordion",
  component: Accordion,
  args: { onValueChange: fn(), className: "max-w-96" },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders leave the warehouse within a day.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Send an item back within 30 days.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="warranty" disabled>
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>Two years.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Opening: Story = {
  play: async ({ args, canvas }) => {
    const shipping = canvas.getByRole("button", { name: "Shipping" });
    const returns = canvas.getByRole("button", { name: "Returns" });
    await expect(shipping).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute("aria-expanded", "true");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["shipping"],
      expect.anything(),
    );
    await waitFor(() =>
      expect(
        canvas.getByText("Orders leave the warehouse within a day."),
      ).toBeVisible(),
    );

    await userEvent.click(returns);
    await expect(returns).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(shipping).toHaveAttribute("aria-expanded", "false"),
    );
  },
};

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["shipping"] },
  play: async ({ canvas }) => {
    const shipping = canvas.getByRole("button", { name: "Shipping" });
    const returns = canvas.getByRole("button", { name: "Returns" });
    await userEvent.click(returns);
    await expect(returns).toHaveAttribute("aria-expanded", "true");
    await expect(shipping).toHaveAttribute("aria-expanded", "true");
  },
};

export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const shipping = canvas.getByRole("button", { name: "Shipping" });
    const returns = canvas.getByRole("button", { name: "Returns" });
    await userEvent.tab();
    await expect(shipping).toHaveFocus();
    await userEvent.tab();
    await expect(returns).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(returns).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(returns).toHaveAttribute("aria-expanded", "false"),
    );
  },
};

export const Disabled: Story = {
  play: async ({ canvas }) => {
    const warranty = canvas.getByRole("button", { name: "Warranty" });
    await userEvent.click(warranty);
    await expect(warranty).toHaveAttribute("aria-expanded", "false");
  },
};
