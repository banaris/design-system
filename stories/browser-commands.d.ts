declare module "vitest/browser" {
  interface BrowserCommands {
    tap: (selector: string, x: number, y: number) => Promise<void>;
  }
}

export {};
