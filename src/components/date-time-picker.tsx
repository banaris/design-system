"use client";

import {
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { CONTROL_SURFACE, TEXT_ENTRY_BOX } from "../lib/class-presets";
import { cn } from "../lib/cn";
import {
  buildDateTime,
  type CalendarDate,
  formatDate,
  isBeforeMin,
  isDayBeforeMin,
  parseDate,
  parseHour,
  parseMinute,
  splitDateTime,
} from "../lib/date-time";
import { Button } from "./button";
import { DateTimeCalendar } from "./date-time-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

export type DateTimePickerClose =
  { outcome: "dismissed" } | { outcome: "applied"; value: string };

export type DateTimePickerProps = {
  /** `""` or a local `YYYY-MM-DDTHH:mm`; anything else is shown as empty. */
  value: string;
  /** Called on `Apply` when the value changed, just before `onClose`. */
  onValueChange: (value: string) => void;
  onClose: (close: DateTimePickerClose) => void;
  /** A local `YYYY-MM-DDTHH:mm` lower bound; a malformed one is ignored. */
  min?: string;
  placeholder?: string;
  portalContainer?: HTMLElement | null | undefined;
} & Pick<
  ComponentProps<"button">,
  | "aria-describedby"
  | "aria-invalid"
  | "aria-label"
  | "aria-labelledby"
  | "className"
  | "disabled"
  | "id"
>;

interface Draft {
  date: string;
  hour: string;
  minute: string;
}

const EMPTY: Draft = { date: "", hour: "", minute: "" };

function today(): CalendarDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function openingDay(value: Draft, min: string | undefined): CalendarDate {
  const own = parseDate(value.date);
  if (own !== null) return own;
  const now = today();
  if (!isDayBeforeMin(now, min)) return now;
  return parseDate(min?.slice(0, 10) ?? "") ?? now;
}

function PopupInput({ className, ...rest }: ComponentProps<"input">) {
  return (
    <input
      className={cn(TEXT_ENTRY_BOX, CONTROL_SURFACE, className)}
      {...rest}
    />
  );
}

const preventEnter = (event: KeyboardEvent) => {
  if (event.key === "Enter") event.preventDefault();
};

export function DateTimePicker({
  value,
  onValueChange,
  onClose,
  min,
  placeholder = "Select date and time",
  portalContainer,
  ...triggerProps
}: DateTimePickerProps) {
  const known = splitDateTime(value);
  const bound = splitDateTime(min ?? "") === null ? undefined : min;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [focusDay, setFocusDay] = useState<CalendarDate>(today);
  const settled = useRef(true);
  const body = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  function begin() {
    const next = known ?? EMPTY;
    settled.current = false;
    setDraft(next);
    setFocusDay(openingDay(next, bound));
    setOpen(true);
  }

  function finish(result: DateTimePickerClose) {
    if (settled.current) return;
    settled.current = true;
    setOpen(false);
    if (result.outcome === "applied" && result.value !== value) {
      onValueChange(result.value);
    }
    onClose(result);
  }

  const latestFinish = useRef(finish);
  useEffect(() => {
    latestFinish.current = finish;
  });

  useEffect(() => {
    if (!open || !(portalContainer instanceof HTMLDialogElement)) return;
    const dialog = portalContainer;
    const dismiss = () => {
      latestFinish.current({ outcome: "dismissed" });
    };
    dialog.addEventListener("close", dismiss);
    return () => {
      dialog.removeEventListener("close", dismiss);
    };
  }, [open, portalContainer]);

  const candidate = buildDateTime(draft.date, draft.hour, draft.minute);
  const beforeMin = candidate !== null && isBeforeMin(candidate, bound);
  const canApply = candidate !== null && !beforeMin;
  const dateInvalid = draft.date !== "" && parseDate(draft.date) === null;
  const hourInvalid = draft.hour !== "" && parseHour(draft.hour) === null;
  const minuteInvalid =
    draft.minute !== "" && parseMinute(draft.minute) === null;

  function select(day: CalendarDate) {
    setDraft((current) => ({
      date: formatDate(day),
      hour: current.hour === "" ? "00" : current.hour,
      minute: current.minute === "" ? "00" : current.minute,
    }));
    setFocusDay(day);
  }

  function typeDate(text: string) {
    setDraft((current) => ({ ...current, date: text }));
    const day = parseDate(text);
    if (day !== null) setFocusDay(day);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason.startsWith("outside")) {
          const target = details.event.target;
          const label =
            target instanceof Element ? target.closest("label") : null;
          if (label !== null && label.control === trigger.current) {
            details.cancel();
            return;
          }
        }
        if (next) begin();
        else finish({ outcome: "dismissed" });
      }}
    >
      <PopoverTrigger
        ref={trigger}
        variant="secondary"
        inField
        {...triggerProps}
      >
        {known === null
          ? placeholder
          : `${known.date} ${known.hour}:${known.minute}`}
      </PopoverTrigger>
      <PopoverContent
        className="coarse:max-w-[min(22rem,var(--available-width))]"
        portalContainer={portalContainer}
        initialFocus={() =>
          body.current?.querySelector<HTMLElement>(
            '[role="grid"] [tabindex="0"]',
          ) ?? true
        }
      >
        <PopoverTitle>Select date and time</PopoverTitle>
        <div ref={body} className="mt-3 flex flex-col gap-3">
          <PopupInput
            aria-label="Date"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            value={draft.date}
            aria-invalid={dateInvalid || undefined}
            onKeyDown={preventEnter}
            onChange={(event) => {
              typeDate(event.target.value);
            }}
          />
          <DateTimeCalendar
            focusDay={focusDay}
            onFocusDayChange={setFocusDay}
            selected={parseDate(draft.date) === null ? "" : draft.date}
            min={bound}
            onSelect={select}
          />
          <div className="flex items-center gap-2">
            <PopupInput
              aria-label="Hour"
              className="w-16 text-center"
              placeholder="HH"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={draft.hour}
              aria-invalid={hourInvalid || undefined}
              onKeyDown={preventEnter}
              onChange={(event) => {
                setDraft({ ...draft, hour: event.target.value });
              }}
            />
            <span aria-hidden className="text-ink">
              :
            </span>
            <PopupInput
              aria-label="Minute"
              className="w-16 text-center"
              placeholder="mm"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={draft.minute}
              aria-invalid={minuteInvalid || undefined}
              onKeyDown={preventEnter}
              onChange={(event) => {
                setDraft({ ...draft, minute: event.target.value });
              }}
            />
          </div>
          {beforeMin && (
            <p role="alert" className="text-small text-danger">
              Choose a time on or after {bound?.replace("T", " ")}.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                finish({ outcome: "dismissed" });
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!canApply}
              onClick={() => {
                if (candidate !== null) {
                  finish({ outcome: "applied", value: candidate });
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
