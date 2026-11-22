declare module "vitest/browser" {
  interface BrowserCommands {
    tap: (selector: string, x: number, y: number) => Promise<void>;
    swipe: (
      selector: string,
      x: number,
      y: number,
      dx: number,
      dy: number,
    ) => Promise<void>;
  }
}

export {};
