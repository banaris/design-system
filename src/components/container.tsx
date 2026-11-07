import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

export type ContainerSize = "narrow" | "default" | "wide";

export type ContainerProps = {
  size?: ContainerSize;
} & ComponentProps<"div">;

const SIZE: Record<ContainerSize, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
};

export function Container({
  size = "wide",
  className,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4", SIZE[size], className)}
      {...rest}
    />
  );
}
