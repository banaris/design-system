"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PopupHiddenContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
} | null>(null);

/* Base UI keeps `open` true while CSS hides an empty popup, so the input must report it. */
export function PopupHiddenProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const value = useMemo(() => ({ hidden, setHidden }), [hidden]);
  return <PopupHiddenContext value={value}>{children}</PopupHiddenContext>;
}

export function usePopupHidden() {
  return useContext(PopupHiddenContext)?.hidden ?? false;
}

export function useReportPopupHidden() {
  const setHidden = useContext(PopupHiddenContext)?.setHidden;
  const [popup, setPopup] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!popup || !setHidden) return;
    const measure = () => {
      setHidden(getComputedStyle(popup).display === "none");
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(popup, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    return () => {
      observer.disconnect();
      setHidden(false);
    };
  }, [popup, setHidden]);
  return useCallback((node: HTMLElement | null) => {
    setPopup(node);
  }, []);
}
