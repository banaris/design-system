import { Field as BaseField } from "@base-ui/react/field";
import { Children, type ComponentProps, createContext, use } from "react";

import { cn } from "../lib/cn";

const ErrorContext = createContext("");

export type FieldProps = Omit<
  ComponentProps<typeof BaseField.Root>,
  "className" | "render" | "invalid"
> & {
  className?: string;
  /** A non-empty string marks the control invalid and is what `FieldError` shows. */
  error?: string;
};

/** Groups a label, a control, a hint and an error, and links them for assistive tech. */
export function Field({ className, error = "", ...rest }: FieldProps) {
  return (
    <ErrorContext value={error}>
      <BaseField.Root
        invalid={error !== ""}
        className={cn("flex flex-col gap-1.5", className)}
        {...rest}
      />
    </ErrorContext>
  );
}

export type FieldLabelProps = Omit<
  ComponentProps<typeof BaseField.Label>,
  "className" | "render"
> & {
  className?: string;
};

/** The control's accessible name; clicking it focuses the control. */
export function FieldLabel({ className, ...rest }: FieldLabelProps) {
  return (
    <BaseField.Label
      className={cn(
        "text-small text-ink data-disabled:text-ink-faint data-disabled:forced-colors:text-[GrayText]",
        className,
      )}
      {...rest}
    />
  );
}

export type FieldHintProps = Omit<
  ComponentProps<typeof BaseField.Description>,
  "className" | "render"
> & {
  className?: string;
};

/** Help text, added to the control's accessible description. */
export function FieldHint({ className, children, ...rest }: FieldHintProps) {
  if (Children.toArray(children).every((child) => child === "")) return null;
  return (
    <BaseField.Description
      className={cn("text-small text-ink-dim", className)}
      {...rest}
    >
      {children}
    </BaseField.Description>
  );
}

export type FieldErrorProps = Omit<
  ComponentProps<typeof BaseField.Error>,
  "className" | "render" | "match"
> & {
  className?: string;
};

/** Shows the `Field`'s `error` (or its own children) in a live region; renders nothing without one. */
export function FieldError({ className, children, ...rest }: FieldErrorProps) {
  const error = use(ErrorContext);
  return (
    <BaseField.Error
      match={error !== ""}
      role="alert"
      className={cn("text-small text-danger", className)}
      {...rest}
    >
      {children ?? error}
    </BaseField.Error>
  );
}

/** A native `<input>` wired to the surrounding `Field`; Base UI controls such as `TextField` already are. */
export const FieldControl = BaseField.Control;
