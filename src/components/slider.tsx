"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import { useEffect, useRef, useState } from "react";

import {
  CONTROL_SURFACE,
  TEXT_ENTRY_BOX,
  TRANSITION_INTERACTIVE,
} from "../lib/class-presets";
import { cn } from "../lib/cn";
import { clampToStep, parseTyped } from "../lib/slider-value";
import { useFieldState } from "./field";

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
  /** Shows a number input beside the track. `className` then goes on the wrapper around both. */
  showInput?: boolean;
  /** With `showInput`, keeps the input visible but not editable. */
  inputReadOnly?: boolean;
  /** Names the input; defaults to `aria-label`, then `aria-labelledby`. Set it inside a `Field`. */
  inputAriaLabel?: string | undefined;
};

type ChangeDetails = BaseSlider.Root.ChangeEventDetails;

/* The browser picks tap or scroll only after `pointerdown`, so a touch press
 * waits in `pending` and drags wait for `intent`; 8px is Android's touch slop. */
const TOUCH_SLOP_PX = 8;

/* WebKit ends a composition before the keydown that confirms it, so `isComposing` is
 * already false there; the key code is still 229. */
const IME_KEY_CODE = 229;

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
  showInput = false,
  inputReadOnly = false,
  inputAriaLabel,
  min = 0,
  max = 100,
  step = 1,
  ...rest
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
  const field = useFieldState();
  const disabled = rest.disabled === true || field.disabled;
  const [draft, setDraftState] = useState<string | null>(null);
  /* A blur fired from inside a commit callback runs on the same render's props. */
  const draftNow = useRef<string | null>(null);
  const setDraft = (next: string | null) => {
    draftNow.current = next;
    setDraftState(next);
  };
  const [described, setDescribed] = useState<string | undefined>();
  const wrapper = useRef<HTMLDivElement>(null);
  const gesture = useRef<TouchGesture | null>(null);
  const current = value ?? uncontrolled;

  const apply = (next: number, details: ChangeDetails) => {
    setDraft(null);
    onValueChange?.(next, details);
    if (!details.isCanceled) setUncontrolled(next);
  };

  const commitDraft = (event: Event) => {
    const text = draftNow.current;
    if (text === null) return;
    setDraft(null);
    const typed = parseTyped(text);
    if (typed === undefined) return;
    const next = clampToStep(typed, min, max, step);
    if (next === current) return;
    const details: ChangeDetails = {
      reason: "none",
      event,
      cancel: () => {
        details.isCanceled = true;
      },
      allowPropagation: () => {
        details.isPropagationAllowed = true;
      },
      isCanceled: false,
      isPropagationAllowed: false,
      trigger: undefined,
      activeThumbIndex: 0,
    };
    apply(next, details);
    if (!details.isCanceled)
      onValueCommitted?.(next, { reason: "none", event });
  };

  /* The thumb's input gets a `Field` hint and error through Base UI; this input is
   * outside that wiring, so it copies the ids. */
  useEffect(() => {
    const thumbInput = wrapper.current?.querySelector('input[type="range"]');
    if (!thumbInput) return;
    const read = () => {
      setDescribed(thumbInput.getAttribute("aria-describedby") ?? undefined);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(thumbInput, {
      attributes: true,
      attributeFilter: ["aria-describedby"],
    });
    return () => {
      observer.disconnect();
    };
  }, [showInput]);

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

  const slider = (
    <BaseSlider.Root
      className={cn(
        "box-border data-disabled:cursor-not-allowed",
        showInput ? "min-w-0 flex-1" : "w-full",
        showInput ? undefined : className,
      )}
      thumbAlignment="edge"
      min={min}
      max={max}
      step={step}
      value={current}
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

  if (!showInput) return slider;

  return (
    <div
      ref={wrapper}
      className={cn("box-border flex w-full items-center gap-3", className)}
    >
      {slider}
      <input
        type="text"
        inputMode="decimal"
        aria-label={inputAriaLabel ?? ariaLabel}
        aria-labelledby={
          inputAriaLabel === undefined && ariaLabel === undefined
            ? rest["aria-labelledby"]
            : undefined
        }
        aria-describedby={described}
        aria-invalid={
          rest["aria-invalid"] ?? (field.invalid ? true : undefined)
        }
        className={cn(
          TEXT_ENTRY_BOX,
          CONTROL_SURFACE,
          "w-20 shrink-0 text-end tabular-nums",
        )}
        disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        readOnly={inputReadOnly}
        value={draft ?? String(current)}
        onChange={(event) => {
          setDraft(event.currentTarget.value);
        }}
        onBlur={(event) => {
          commitDraft(event.nativeEvent);
        }}
        onKeyDown={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-deprecated -- no other signal for the WebKit keydown
          if (event.nativeEvent.isComposing || event.keyCode === IME_KEY_CODE)
            return;
          if (event.key === "Enter") commitDraft(event.nativeEvent);
          if (event.key === "Escape" && draft !== null) {
            event.stopPropagation();
            setDraft(null);
          }
        }}
      />
    </div>
  );
}
