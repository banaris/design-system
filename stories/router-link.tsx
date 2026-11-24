import type { ComponentProps } from "react";

/* Stands in for a framework's link: renders an `<a>` and navigates through a
 * callback instead of unloading the document, as a client-side router does. */
export function RouterLink({
  to,
  onNavigate,
  onClick,
  children,
  ...rest
}: { to: string; onNavigate?: (to: string) => void } & Omit<
  ComponentProps<"a">,
  "href"
>) {
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onNavigate?.(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
