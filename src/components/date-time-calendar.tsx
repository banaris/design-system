"use client";

import {
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";

import { FOCUS_RING, TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";
import { ChevronIcon } from "../lib/control-icons";
import {
  addDays,
  addMonths,
  type CalendarDate,
  formatDate,
  isDayBeforeMin,
  monthWeeks,
  toUtc,
  weekColumn,
  type WeekStart,
} from "../lib/date-time";
import { IconButton } from "./icon-button";

const A_SUNDAY: CalendarDate = { year: 2023, month: 1, day: 1 };

function createNames(locale: string) {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone: "UTC",
    });
  const month = format({ month: "long", year: "numeric" });
  const day = format({ dateStyle: "full" });
  const long = format({ weekday: "long" });
  const short = format({ weekday: "short" });
  const sundayFirst = Array.from({ length: 7 }, (_, sundayBased) =>
    toUtc({ ...A_SUNDAY, day: A_SUNDAY.day + sundayBased }),
  );
  const shorts = sundayFirst.map((date) => short.format(date));
  const segmenter = new Intl.Segmenter(locale);
  const graphemes = shorts.map((text) =>
    Array.from(segmenter.segment(text), ({ segment }) => segment),
  );
  const prefixes = [2, 3, 4].map((length) =>
    graphemes.map((parts) => parts.slice(0, length).join("")),
  );
  const narrowNames = format({ weekday: "narrow" });
  const narrows = sundayFirst.map((date) => narrowNames.format(date));
  const labels =
    [...prefixes, narrows].find((candidate) => new Set(candidate).size === 7) ??
    shorts;
  return {
    month: (date: Date) => month.format(date),
    day: (date: Date) => day.format(date),
    weekday: (sundayBased: number) => ({
      long: long.format(sundayFirst[sundayBased]),
      label: labels[sundayBased],
    }),
  };
}

function PreviousIcon(props: ComponentProps<"svg">) {
  return (
    <ChevronIcon {...props} className={cn(props.className, "rotate-90")} />
  );
}

function NextIcon(props: ComponentProps<"svg">) {
  return (
    <ChevronIcon {...props} className={cn(props.className, "-rotate-90")} />
  );
}

export interface DateTimeCalendarProps {
  focusDay: CalendarDate;
  onFocusDayChange: (day: CalendarDate) => void;
  selected: string;
  min: string | undefined;
  onSelect: (day: CalendarDate) => void;
  locale: string;
  weekStart: WeekStart;
  previousMonthLabel: string;
  nextMonthLabel: string;
}

export function DateTimeCalendar({
  focusDay,
  onFocusDayChange,
  selected,
  min,
  onSelect,
  locale,
  weekStart,
  previousMonthLabel,
  nextMonthLabel,
}: DateTimeCalendarProps) {
  const names = useMemo(() => createNames(locale), [locale]);
  const weekdays = Array.from({ length: 7 }, (_, column) =>
    names.weekday((weekStart + column) % 7),
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const headingId = `${useId()}-heading`;
  const focusKey = formatDate(focusDay);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-date="${focusKey}"]`)
      ?.focus();
  }, [focusKey]);

  function goTo(day: CalendarDate | null) {
    if (day === null) return;
    moveFocus.current = formatDate(day) !== focusKey;
    onFocusDayChange(day);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, day: CalendarDate) {
    const column = weekColumn(day, weekStart);
    const target = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => addDays(day, -column),
      End: () => addDays(day, 6 - column),
      PageUp: () => addMonths(day, -1),
      PageDown: () => addMonths(day, 1),
    }[event.key];
    if (target !== undefined) {
      event.preventDefault();
      goTo(target());
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isDayBeforeMin(day, min)) onSelect(day);
    }
  }

  function shiftMonth(months: number) {
    const next = addMonths(focusDay, months);
    if (next !== null) onFocusDayChange(next);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <IconButton
          icon={PreviousIcon}
          variant="ghost"
          size="sm"
          aria-label={previousMonthLabel}
          onClick={() => {
            shiftMonth(-1);
          }}
        />
        <div
          id={headingId}
          aria-live="polite"
          aria-atomic
          className="text-ink text-base font-semibold"
        >
          {names.month(toUtc(focusDay))}
        </div>
        <IconButton
          icon={NextIcon}
          variant="ghost"
          size="sm"
          aria-label={nextMonthLabel}
          onClick={() => {
            shiftMonth(1);
          }}
        />
      </div>
      <div
        ref={gridRef}
        role="grid"
        aria-labelledby={headingId}
        className="coarse:min-w-max"
      >
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((name) => (
            <div
              key={name.long}
              role="columnheader"
              aria-label={name.long}
              className="text-ink-dim w-0 min-w-full py-1 text-center text-sm [overflow-wrap:anywhere]"
            >
              {name.label}
            </div>
          ))}
        </div>
        {monthWeeks(focusDay.year, focusDay.month, weekStart).map(
          (week, row) => (
            <div key={row} role="row" className="grid grid-cols-7">
              {week.map((day, column) => {
                if (day === null) {
                  return <div key={column} role="gridcell" aria-hidden />;
                }
                const key = formatDate(day);
                const unavailable = isDayBeforeMin(day, min);
                return (
                  <div
                    key={column}
                    role="gridcell"
                    tabIndex={key === focusKey ? 0 : -1}
                    data-date={key}
                    aria-label={names.day(toUtc(day))}
                    aria-selected={key === selected}
                    aria-disabled={unavailable || undefined}
                    className={cn(
                      "text-ink touch-target box-border flex size-9 cursor-pointer items-center justify-center rounded-md text-base select-none",
                      TRANSITION_INTERACTIVE,
                      FOCUS_RING,
                      "hover:not-aria-disabled:bg-surface-hover",
                      "aria-selected:bg-fill aria-selected:text-on-fill aria-selected:hover:not-aria-disabled:bg-fill-hover",
                      "aria-disabled:text-ink-faint aria-disabled:cursor-not-allowed aria-disabled:forced-colors:text-[GrayText]",
                    )}
                    onClick={() => {
                      if (!unavailable) onSelect(day);
                      onFocusDayChange(day);
                    }}
                    onKeyDown={(event) => {
                      onKeyDown(event, day);
                    }}
                  >
                    {day.day}
                  </div>
                );
              })}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
