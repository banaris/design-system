import { Icon } from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Info, TriangleAlert } from "lucide-react";
import { expect } from "storybook/test";

const meta = {
  title: "Foundations/Icon",
  component: Icon,
  args: { icon: Check },
  parameters: {
    docs: {
      description: {
        component:
          "The package ships no icon set. Use `lucide-react` (`pnpm add lucide-react`) and pass a glyph as `icon`: `<Icon icon={Check} />`. It is not a dependency of this package. `Icon` fixes the size steps, follows `currentColor`, and hides the glyph from assistive technology unless given a `label`.",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="text-ink flex items-end gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={Info} size={size} />
          <span className="text-ink-faint text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = canvas
      .getAllByText(/^(sm|md|lg)$/)
      .map((label) => label.previousElementSibling?.getBoundingClientRect());
    await expect(sizes.map((box) => box?.width)).toEqual([16, 20, 24]);
  },
};

export const InheritsColour: Story = {
  render: () => (
    <p className="text-danger flex items-center gap-2">
      <Icon icon={TriangleAlert} />
      Something needs attention.
    </p>
  ),
  play: async ({ canvas }) => {
    const text = canvas.getByText("Something needs attention.");
    const svg = text.querySelector("svg");
    if (svg === null) throw new Error("icon missing");
    await expect(getComputedStyle(svg).color).toBe(
      getComputedStyle(text).color,
    );
  },
};

export const Hidden: Story = {
  render: () => (
    <button type="button" className="text-ink flex items-center gap-2">
      <Icon icon={Check} />
      Save
    </button>
  ),
  play: async ({ canvas }) => {
    const svg = canvas
      .getByRole("button", { name: "Save" })
      .querySelector("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(svg).not.toHaveAttribute("role");
  },
};

export const Named: Story = {
  args: { label: "Saved" },
  play: async ({ canvas }) => {
    const svg = canvas.getByRole("img", { name: "Saved" });
    await expect(svg).not.toHaveAttribute("aria-hidden");
  },
};
