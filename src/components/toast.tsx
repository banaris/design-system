"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ComponentProps } from "react";

import {
  FOCUS_RING,
  OVERLAY_MOTION,
  OVERLAY_POPUP,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import { CloseIcon } from "../lib/control-icons";

export type ToastProviderProps = ComponentProps<typeof BaseToast.Provider>;

/** Owns the toast queue; render one `Toaster` inside it and call `useToast().add(…)` from anywhere below. */
export const ToastProvider = BaseToast.Provider;

export const useToast = BaseToast.useToastManager;

export interface ToasterProps {
  closeLabel?: string;
  className?: string;
}

export function Toaster({ closeLabel = "Dismiss", className }: ToasterProps) {
  const { toasts } = useToast();
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        className={cn(
          "fixed right-[var(--ds-edge-right)] bottom-[var(--ds-edge-bottom)] z-[var(--z-toast)] flex w-[min(24rem,calc(100vw-var(--ds-edge-left)-var(--ds-edge-right)))] flex-col gap-2",
          className,
        )}
      >
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={cn(
              OVERLAY_POPUP,
              OVERLAY_MOTION,
              "coarse:pe-14 relative p-4 pe-10 data-limited:hidden",
            )}
          >
            <BaseToast.Content>
              <BaseToast.Title className="text-ds-base font-semibold" />
              <BaseToast.Description className="text-small text-ink-dim mt-1" />
              <BaseToast.Action
                className={cn(
                  "touch-target text-small text-accent-soft rounded-ds-sm mt-2 inline-flex cursor-pointer items-center font-semibold hover:underline",
                  FOCUS_RING,
                )}
              />
              <BaseToast.Close
                aria-label={closeLabel}
                className={cn(
                  "touch-target text-ink-dim hover:bg-surface-hover rounded-ds-sm absolute end-2 top-2 inline-flex cursor-pointer items-center justify-center p-1",
                  FOCUS_RING,
                )}
              >
                <CloseIcon className="size-4" />
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
