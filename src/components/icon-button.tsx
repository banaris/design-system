import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";
import { BASE, type ButtonVariant, VARIANT } from "./button";
import { Icon, type IconProps, type IconSize } from "./icon";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export type IconButtonProps = {
  icon: IconProps["icon"];
  /** Accessible name. Required: with no text the button would be announced as unlabelled. */
  "aria-label": string;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  pill?: boolean;
} & Omit<
  ComponentProps<typeof BaseButton>,
  "aria-label" | "children" | "className" | "render"
> & {
    className?: string;
  };

const SIZE: Record<IconButtonSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const ICON_SIZE: Record<IconButtonSize, IconSize> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
};

export function IconButton({
  icon,
  variant = "primary",
  size = "md",
  pill = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <BaseButton
      type={type}
      className={cn(
        BASE,
        pill ? "rounded-pill" : "rounded-md",
        VARIANT[variant],
        "p-0",
        SIZE[size],
        className,
      )}
      {...rest}
    >
      <Icon icon={icon} size={ICON_SIZE[size]} />
    </BaseButton>
  );
}
