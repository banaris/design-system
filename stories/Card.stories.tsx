import {
  Card,
  Heading,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Surfaces/Card",
  component: Card,
  args: { children: "A panel raised off the page." },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const card = canvas.getByText("A panel raised off the page.");
    const style = getComputedStyle(card);
    await expect(style.boxShadow).not.toBe("none");
    await expect(style.borderTopWidth).toBe("1px");
  },
};

export const WithListAndTable: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card>
        <Heading level={2}>Today</Heading>
        <List>
          <ListItem>09:00 Standup</ListItem>
          <ListItem>10:30 Review the table PR</ListItem>
        </List>
      </Card>
      <Card>
        <Heading level={2}>This month</Heading>
        <Table>
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
          </TableBody>
        </Table>
      </Card>
    </div>
  ),
};
