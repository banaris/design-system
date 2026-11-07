import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type ContainerSize = "sm" | "md" | "lg";

export type ContainerProps = {
  size?: ContainerSize;
} & ComponentProps<"div">;

const SIZE: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
};

export function Container({ size = "lg", className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6", SIZE[size], className)}
      {...rest}
    />
  );
}
