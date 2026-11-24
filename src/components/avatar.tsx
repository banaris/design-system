import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = Omit<
  ComponentProps<typeof BaseAvatar.Root>,
  "className" | "render" | "children" | "aria-label"
> & {
  className?: string;
  size?: AvatarSize;
  /** Names the avatar for assistive technology. Required: the picture and the fallback are both hidden from it. */
  "aria-label": string;
  /** The picture's address. While it loads, or if it fails, `children` is shown instead. */
  src?: string | undefined;
  /** What stands in for the picture, usually initials. */
  children?: ReactNode;
};

const SIZE: Record<AvatarSize, string> = {
  sm: "size-8 text-ds-sm",
  md: "size-10 text-ds-base",
  lg: "size-14 text-ds-lg",
};

/** A person or account picture that falls back to `children` when there is no picture. */
export function Avatar({
  className,
  size = "md",
  src,
  children,
  ...rest
}: AvatarProps) {
  return (
    <BaseAvatar.Root
      role="img"
      className={cn(
        "rounded-pill bg-surface-sunken text-ink-dim box-border inline-flex shrink-0 items-center justify-center overflow-hidden align-middle font-semibold select-none forced-colors:text-[CanvasText]",
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {src === undefined ? null : (
        <BaseAvatar.Image src={src} alt="" className="size-full object-cover" />
      )}
      <BaseAvatar.Fallback>{children}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
