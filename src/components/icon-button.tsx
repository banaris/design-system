import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";

import { cn } from "../lib/cn";
import { BASE, type ButtonVariant, VARIANT } from "./button";
import { Icon, type IconProps, type IconSize } from "./icon";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export type IconButtonProps = {
  icon: IconProps["icon"];
  /** Accessible name. Required; the type cannot reject `""`, so pass a real label. */
  "aria-label": string;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  pill?: boolean;
} & Omit<
  ComponentProps<typeof BaseButton>,
  "aria-label" | "children" | "className"
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
  nativeButton = true,
  role = nativeButton ? undefined : "link",
  disabled,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <BaseButton
      type={nativeButton ? type : undefined}
      nativeButton={nativeButton}
      role={role}
      disabled={disabled}
      className={cn(
        BASE,
        pill ? "rounded-pill" : "rounded-ds-md",
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
