"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import {
  Children,
  type ComponentProps,
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { cn } from "../lib/cn";
import { ErrorMessage } from "./error-message";

const FieldsetContext = createContext<{
  error: string;
  legendId: string | undefined;
}>({ error: "", legendId: undefined });

const DescribeContext = createContext(
  (_id: string): (() => void) =>
    () =>
      undefined,
);

/** The enclosing `Fieldset`'s legend id and whether its `error` is set, for a group that the legend names and the error marks. */
export const useFieldsetState = () => {
  const { error, legendId } = use(FieldsetContext);
  return { legendId, invalid: error !== "" };
};

export type FieldsetProps = Omit<
  ComponentProps<typeof BaseFieldset.Root>,
  "className" | "render"
> & {
  className?: string;
  /** A non-empty string is what `FieldsetError` shows. */
  error?: string;
};

/** Gives a group one visible name, a hint and an error; a `RadioGroup` or `CheckboxGroup` inside takes the legend's name. */
export function Fieldset({
  className,
  error = "",
  "aria-describedby": describedBy,
  ...rest
}: FieldsetProps) {
  const [ids, setIds] = useState<string[]>([]);
  const legendId = useId();
  const describe = useCallback((id: string) => {
    setIds((current) => [...current, id]);
    return () => {
      setIds((current) => current.filter((item) => item !== id));
    };
  }, []);
  const state = useMemo(() => ({ error, legendId }), [error, legendId]);
  const described = [describedBy, ...ids].filter(Boolean).join(" ");
  return (
    <FieldsetContext value={state}>
      <DescribeContext value={describe}>
        <BaseFieldset.Root
          aria-describedby={described === "" ? undefined : described}
          className={cn(
            "m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0",
            className,
          )}
          {...rest}
        />
      </DescribeContext>
    </FieldsetContext>
  );
}

export type FieldsetLegendProps = Omit<
  ComponentProps<typeof BaseFieldset.Legend>,
  "className" | "render" | "id"
> & {
  className?: string;
};

/** The group's accessible name, shown above it. */
export function FieldsetLegend({ className, ...rest }: FieldsetLegendProps) {
  const { legendId } = use(FieldsetContext);
  return (
    <BaseFieldset.Legend
      className={cn(
        "text-small text-ink data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]",
        className,
      )}
      {...rest}
      id={legendId}
    />
  );
}

function useDescribes(id: string, active: boolean) {
  const describe = use(DescribeContext);
  useEffect(() => (active ? describe(id) : undefined), [active, describe, id]);
}

export type FieldsetHintProps = ComponentProps<"p">;

/** Help text, added to the group's accessible description. */
export function FieldsetHint({
  className,
  children,
  ...rest
}: FieldsetHintProps) {
  const generated = useId();
  const id = rest.id ?? generated;
  const empty = Children.toArray(children).every((child) => child === "");
  useDescribes(id, !empty);
  if (empty) return null;
  return (
    <p className={cn("text-small text-ink-dim", className)} {...rest} id={id}>
      {children}
    </p>
  );
}

export type FieldsetErrorProps = ComponentProps<"p">;

/** Shows the `Fieldset`'s `error`; nothing renders without one. */
export function FieldsetError({ children, ...rest }: FieldsetErrorProps) {
  const { error } = use(FieldsetContext);
  const generated = useId();
  const id = rest.id ?? generated;
  const shown = error !== "";
  useDescribes(id, shown);
  if (!shown) return null;
  return (
    <ErrorMessage {...rest} id={id}>
      {children ?? error}
    </ErrorMessage>
  );
}
