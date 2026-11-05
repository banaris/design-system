import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { resolveToken } from "./border-color";

const meta = {
  title: "Surfaces/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const BORDER_TOP = (el: HTMLElement) => getComputedStyle(el).borderTopWidth;
const BORDER_BOTTOM = (el: HTMLElement) =>
  getComputedStyle(el).borderBottomWidth;

export const Default: Story = {
  render: (args) => (
    <Table {...args} aria-label="Month summary">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Project</TableHead>
          <TableHead scope="col">Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Design system</TableCell>
          <TableCell>42</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Timetracker</TableCell>
          <TableCell>31</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>73</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(2);
    await expect(canvas.getAllByRole("row")).toHaveLength(4);
    await expect(
      canvas.getByRole("cell", { name: "Total" }).closest("tfoot"),
    ).not.toBeNull();

    const header = canvas.getAllByRole("columnheader")[0]?.closest("tr");
    const first = canvas
      .getByRole("cell", { name: "Design system" })
      .closest("tr");
    const last = canvas
      .getByRole("cell", { name: "Timetracker" })
      .closest("tr");
    const total = canvas.getByRole("cell", { name: "Total" }).closest("tr");
    if (!header || !first || !last || !total) throw new Error("rows missing");

    const thead = header.closest("thead");
    const tfoot = total.closest("tfoot");
    if (!thead || !tfoot) throw new Error("sections missing");

    await expect(BORDER_BOTTOM(thead)).toBe("1px");
    await expect(getComputedStyle(thead).borderBottomColor).toBe(
      resolveToken("--color-border"),
    );
    await expect(first.className).toContain("hover:bg-surface-hover");
    await expect(BORDER_TOP(first)).toBe("0px");
    await expect(BORDER_TOP(last)).toBe("1px");
    await expect(getComputedStyle(last).borderTopColor).toBe(
      resolveToken("--color-border"),
    );
    await expect(BORDER_BOTTOM(last)).toBe("0px");
    await expect(BORDER_TOP(tfoot)).toBe("1px");
    await expect(BORDER_BOTTOM(total)).toBe("0px");
  },
};

export const DarkRowDivider: Story = {
  globals: { theme: "dark" },
  render: () => (
    <Table aria-label="Dark dividers">
      <TableBody>
        <TableRow>
          <TableCell>Upper row</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Lower row</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const lower = canvas.getByRole("cell", { name: "Lower row" }).closest("tr");
    if (!lower) throw new Error("row missing");
    const divider = getComputedStyle(lower).borderTopColor;
    await expect(divider).toBe(resolveToken("--color-border-strong"));
    await expect(divider).not.toBe(resolveToken("--color-surface-hover"));
  },
};

export const CallerClassName: Story = {
  render: () => (
    <Table aria-label="Override" className="w-1/2">
      <TableBody>
        <TableRow className="hover:bg-accent border-b-2">
          <TableCell className="text-danger">Only row</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByRole("cell", { name: "Only row" }).closest("tr");
    if (!row) throw new Error("row missing");
    await expect(BORDER_BOTTOM(row)).toBe("2px");
    await expect(row.className).toContain("hover:bg-accent");
    await expect(row.className).not.toContain("hover:bg-surface-hover");
    await expect(
      getComputedStyle(canvas.getByRole("cell", { name: "Only row" })).color,
    ).toBe(resolveToken("--color-danger"));
    const table = canvas.getByRole("table");
    const parent = table.parentElement;
    if (!parent) throw new Error("table has no parent");
    await expect(table.getBoundingClientRect().width).toBeLessThan(
      parent.getBoundingClientRect().width * 0.75,
    );
  },
};
