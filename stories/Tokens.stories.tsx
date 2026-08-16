import type { Meta, StoryObj } from "@storybook/react-vite";

/* The token catalogue reads its values from the live cascade rather than from
 * a table written by hand, so a page that renders is proof the tokens are
 * actually reaching the DOM — a hand-maintained list would keep looking
 * correct after the CSS stopped shipping. */
const readToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const Swatch = ({ token, note }: { token: string; note?: string }) => (
  <div className="flex items-center gap-3">
    <div
      className="border-border size-12 shrink-0 rounded-sm border"
      style={{ background: `var(${token})` }}
    />
    <div className="min-w-0">
      <div className="text-ink font-mono text-sm">{token}</div>
      <div className="text-ink-faint text-xs">{readToken(token) || "—"}</div>
      {note !== undefined && <div className="text-ink-dim text-xs">{note}</div>}
    </div>
  </div>
);

const Group = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-label text-ink-faint uppercase">{title}</h2>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {children}
    </div>
  </section>
);

const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colour: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Group title="Brand">
        <Swatch token="--color-accent" note="Fill only — never text" />
        <Swatch token="--color-accent-soft" note="Text and icons" />
        <Swatch token="--color-on-accent" note="Label on the accent fill" />
        <Swatch token="--color-shell" note="Inverted plane" />
        <Swatch token="--color-on-shell" />
      </Group>
      <Group title="Surface">
        <Swatch token="--color-bg" />
        <Swatch token="--color-bg-elevated" />
        <Swatch token="--color-surface" />
        <Swatch token="--color-surface-sunken" />
        <Swatch token="--color-surface-hover" />
      </Group>
      <Group title="Text">
        <Swatch token="--color-ink" />
        <Swatch token="--color-ink-dim" />
        <Swatch token="--color-ink-faint" />
      </Group>
      <Group title="Fill">
        <Swatch token="--color-fill" />
        <Swatch token="--color-on-fill" />
      </Group>
      <Group title="Border">
        <Swatch token="--color-border" note="Decorative" />
        <Swatch token="--color-border-strong" note="Decorative" />
        <Swatch token="--color-control-border" note="Controls — meets 3:1" />
      </Group>
      <Group title="Status">
        <Swatch token="--color-success" />
        <Swatch token="--color-warning" />
        <Swatch token="--color-danger" />
        <Swatch token="--color-info" />
      </Group>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-label text-ink-faint uppercase">
          Semantic — weight and leading included
        </h2>
        <p className="text-display text-ink">Display</p>
        <p className="text-h1 text-ink">Heading 1</p>
        <p className="text-h2 text-ink">Heading 2</p>
        <p className="text-body text-ink">
          Body. The semantic tier carries its own weight and line height, so one
          class is enough.
        </p>
        <p className="text-small text-ink-dim">Small — supporting prose</p>
        <p className="text-label text-ink-faint uppercase">Label</p>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-label text-ink-faint uppercase">
          Utility — size only
        </h2>
        <p className="text-ink text-lg">Large — dialog titles</p>
        <p className="text-ink text-base">Base — controls and inputs</p>
        <p className="text-ink text-sm">Small — helper text</p>
        <p className="text-ink text-xs">Extra small — badges and metadata</p>
      </section>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {["xs", "sm", "md", "lg", "shell", "pill"].map((step) => (
        <div key={step} className="flex flex-col items-center gap-2">
          <div
            className="border-border bg-surface size-20 border"
            style={{ borderRadius: `var(--radius-${step})` }}
          />
          <span className="text-ink-dim font-mono text-xs">{step}</span>
        </div>
      ))}
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-4">
      {["soft", "raised", "overlay"].map((step) => (
        <div key={step} className="flex flex-col items-center gap-3">
          <div
            className="bg-surface size-24 rounded-md"
            style={{ boxShadow: `var(--shadow-${step})` }}
          />
          <span className="text-ink-dim font-mono text-xs">{step}</span>
        </div>
      ))}
    </div>
  ),
};
