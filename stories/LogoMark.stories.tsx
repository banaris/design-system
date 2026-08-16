import { LogoMark } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Logo Mark",
  component: LogoMark,
  args: { size: 64 },
} satisfies Meta<typeof LogoMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="text-ink flex items-end gap-6">
      {[16, 24, 32, 48, 96].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <LogoMark size={size} />
          <span className="text-ink-faint text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/* The mark takes its ring from `currentColor`, so it inverts by inheritance
 * rather than by a prop. */
export const OnShell: Story = {
  render: () => (
    <div className="bg-shell text-on-shell flex items-center gap-4 rounded-lg px-8 py-6">
      <LogoMark size={48} />
      <span className="text-h2">Banaris</span>
    </div>
  ),
};

export const Labelled: Story = {
  args: { title: "Banaris" },
};
