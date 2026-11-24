"use client";

import {
  createContext,
  type ReactNode,
  use,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const PopupHiddenContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}>({ hidden: false, setHidden: () => undefined });

/* Base UI keeps `open` true while CSS hides an empty popup, so the input must report it. */
export function PopupHiddenProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const value = useMemo(() => ({ hidden, setHidden }), [hidden]);
  return <PopupHiddenContext value={value}>{children}</PopupHiddenContext>;
}

export function usePopupHiddenInputProps() {
  return use(PopupHiddenContext).hidden
    ? { "aria-expanded": false, "aria-controls": undefined }
    : undefined;
}

/** Ref for the popup's positioner; its first child is the popup, so a consumer's own popup `ref` stays free. */
export function usePositionerRef() {
  const { setHidden } = use(PopupHiddenContext);
  const [positioner, setPositioner] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const popup = positioner?.firstElementChild;
    if (!positioner || !popup) return;
    const measure = () => {
      setHidden(getComputedStyle(popup).display === "none");
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(positioner, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    return () => {
      observer.disconnect();
      setHidden(false);
    };
  }, [positioner, setHidden]);
  return setPositioner;
}
