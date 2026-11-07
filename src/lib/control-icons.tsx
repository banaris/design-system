import type { ComponentProps } from "react";

const ICON_PROPS = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} satisfies ComponentProps<"svg">;

export function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

export function DashIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <path d="M4 8h8" />
    </svg>
  );
}

export function ChevronIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <path d="M4 6.5 8 10.5 12 6.5" />
    </svg>
  );
}
