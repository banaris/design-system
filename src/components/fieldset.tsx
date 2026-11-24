"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import {
  type ComponentProps,
  createContext,
  use,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { cn } from "../lib/cn";

const FieldsetContext = createContext({
  error: "",
  describe:
    (_id: string): (() => void) =>
    () =>
      undefined,
});

export type FieldsetProps = Omit<
  ComponentProps<typeof BaseFieldset.Root>,
  "className" | "render"
> & {
  className?: string;
  /** A non-empty string is what `FieldsetError` shows. */
  error?: string;
};

/** Gives a group one visible name, a hint and an error; a `RadioGroup` inside takes the legend's name. */
export function Fieldset({
  className,
  error = "",
  "aria-describedby": describedBy,
  ...rest
}: FieldsetProps) {
  const [ids, setIds] = useState<string[]>([]);
  const context = useMemo(
    () => ({
      error,
      describe: (id: string) => {
        setIds((current) => [...current, id]);
        return () => {
          setIds((current) => current.filter((item) => item !== id));
        };
      },
    }),
    [error],
  );
  const described = [describedBy, ...ids].filter(Boolean).join(" ");
  return (
    <FieldsetContext value={context}>
      <BaseFieldset.Root
        aria-describedby={described === "" ? undefined : described}
        className={cn(
          "m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0",
          className,
        )}
        {...rest}
      />
    </FieldsetContext>
  );
}

export type FieldsetLegendProps = Omit<
  ComponentProps<typeof BaseFieldset.Legend>,
  "className" | "render"
> & {
  className?: string;
};

/** The group's accessible name, shown above it. */
export function FieldsetLegend({ className, ...rest }: FieldsetLegendProps) {
  return (
    <BaseFieldset.Legend
      className={cn(
        "text-small text-ink data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]",
        className,
      )}
      {...rest}
    />
  );
}

function useDescribes(id: string, active: boolean) {
  const { describe } = use(FieldsetContext);
  useEffect(() => (active ? describe(id) : undefined), [active, describe, id]);
}

export type FieldsetHintProps = Omit<ComponentProps<"p">, "className"> & {
  className?: string;
};

/** Help text, added to the group's accessible description. */
export function FieldsetHint({ className, ...rest }: FieldsetHintProps) {
  const generated = useId();
  const id = rest.id ?? generated;
  useDescribes(id, true);
  return (
    <p id={id} className={cn("text-small text-ink-dim", className)} {...rest} />
  );
}

export type FieldsetErrorProps = Omit<ComponentProps<"p">, "className"> & {
  className?: string;
};

/** Shows the `Fieldset`'s `error`; nothing renders without one. */
export function FieldsetError({
  className,
  children,
  ...rest
}: FieldsetErrorProps) {
  const { error } = use(FieldsetContext);
  const generated = useId();
  const id = rest.id ?? generated;
  const shown = error !== "";
  useDescribes(id, shown);
  if (!shown) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-small text-danger", className)}
      {...rest}
    >
      {children ?? error}
    </p>
  );
}
