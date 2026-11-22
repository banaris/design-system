"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import { useRef, useState } from "react";

import { TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type SliderProps = Omit<
  BaseSlider.Root.Props<number>,
  | "className"
  | "render"
  | "children"
  | "orientation"
  | "thumbAlignment"
  | "thumbCollisionBehavior"
  | "minStepsBetweenValues"
> & {
  className?: string;
  "aria-label"?: string | undefined;
};

type ChangeDetails = BaseSlider.Root.ChangeEventDetails;

/* The browser picks tap or scroll only after `pointerdown`, so a touch press
 * waits in `pending` and drags wait for `intent`; 8px is Android's touch slop. */
const TOUCH_SLOP_PX = 8;

interface TouchGesture {
  x: number;
  y: number;
  intent: "undecided" | "drag" | "scroll";
  pending: { value: number; details: ChangeDetails } | null;
}

const fingerOf = (event: Event) => {
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent)
    return event.touches[0];
  return event instanceof MouseEvent ? event : undefined;
};

/** A single-value slider; name it with `aria-label`, `aria-labelledby` or a `Field` label. */
export function Slider({
  className,
  "aria-label": ariaLabel,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  ...rest
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? rest.min ?? 0,
  );
  const gesture = useRef<TouchGesture | null>(null);

  const apply = (next: number, details: ChangeDetails) => {
    onValueChange?.(next, details);
    if (!details.isCanceled) setUncontrolled(next);
  };

  const handleValueChange = (next: number, details: ChangeDetails) => {
    const touch = gesture.current;
    const pressed =
      details.event.type === "pointerdown" ||
      details.event.type === "touchstart";
    if (!touch || !(pressed || details.reason === "drag")) {
      apply(next, details);
      return;
    }
    if (pressed) {
      details.cancel();
      touch.pending = { value: next, details };
      return;
    }
    const finger = fingerOf(details.event);
    if (touch.intent === "undecided" && finger) {
      const dx = Math.abs(finger.clientX - touch.x);
      const dy = Math.abs(finger.clientY - touch.y);
      if (Math.max(dx, dy) >= TOUCH_SLOP_PX) {
        touch.intent = dx > dy ? "drag" : "scroll";
        touch.pending = null;
      }
    }
    if (touch.intent !== "drag") {
      details.cancel();
      return;
    }
    touch.pending = null;
    apply(next, details);
  };

  const endGesture = () => {
    gesture.current = null;
  };

  return (
    <BaseSlider.Root
      className={cn(
        "box-border w-full data-disabled:cursor-not-allowed",
        className,
      )}
      thumbAlignment="edge"
      value={value ?? uncontrolled}
      onValueChange={handleValueChange}
      onValueCommitted={onValueCommitted}
      {...rest}
    >
      <BaseSlider.Control
        className="flex h-6 w-full cursor-pointer touch-pan-y items-center select-none data-disabled:cursor-not-allowed"
        onPointerDown={(event) => {
          gesture.current =
            event.pointerType === "touch" || event.pointerType === "pen"
              ? {
                  x: event.clientX,
                  y: event.clientY,
                  intent: "undecided",
                  pending: null,
                }
              : null;
        }}
        onPointerCancel={() => {
          if (gesture.current) {
            gesture.current.intent = "scroll";
            gesture.current.pending = null;
          }
        }}
        onPointerUp={() => {
          const pending = gesture.current?.pending;
          gesture.current = null;
          if (!pending) return;
          const details = { ...pending.details, isCanceled: false };
          details.cancel = () => {
            details.isCanceled = true;
          };
          apply(pending.value, details);
          if (!details.isCanceled) onValueCommitted?.(pending.value, details);
        }}
        onTouchEnd={endGesture}
        onTouchCancel={endGesture}
      >
        <BaseSlider.Track className="rounded-pill border-control-border bg-surface-sunken data-invalid:not-data-disabled:border-danger box-border h-1.5 w-full border border-solid data-disabled:border-transparent">
          <BaseSlider.Indicator className="rounded-pill bg-fill data-disabled:bg-ink-faint forced-colors:bg-[Highlight] data-disabled:forced-colors:bg-[GrayText]" />
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className={cn(
              "rounded-pill bg-fill data-disabled:bg-ink-faint has-focus-visible:shadow-focus box-border size-5 outline-none has-focus-visible:z-10 has-focus-visible:outline-hidden forced-colors:bg-[CanvasText] data-disabled:forced-colors:bg-[GrayText]",
              TRANSITION_INTERACTIVE,
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
