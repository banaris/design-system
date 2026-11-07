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

export function CloseIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function InfoIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3.5M8 5.2h.01" />
    </svg>
  );
}

export function SuccessIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8.2 7.2 9.9 10.5 6.2" />
    </svg>
  );
}

export function WarningIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <path d="M8 2.5 14 13H2Z" />
      <path d="M8 6.5v3M8 11.4h.01" />
    </svg>
  );
}

export function DangerIcon(props: ComponentProps<"svg">) {
  return (
    <svg {...ICON_PROPS} aria-hidden {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.8v3.8M8 11h.01" />
    </svg>
  );
}
