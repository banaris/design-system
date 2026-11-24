import {
  Drawer,
  DrawerClose,
  DrawerContent,
  type DrawerContentProps,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@banaris/design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { expectInsideInsets, withInsets } from "./safe-area";
import { expectVisible } from "./visible";

/* `vitest/browser` throws when imported outside Vitest, so a plain Storybook
 * gets no commands and the swipe assertion below is skipped. */
const touchCommands = async () => {
  if (!matchMedia("(any-pointer: coarse)").matches) return null;
  try {
    return (await import("vitest/browser")).commands;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Browser Mode"))
      return null;
    throw error;
  }
};

type Side = NonNullable<DrawerContentProps["side"]>;

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: { onOpenChange: fn() },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger variant="secondary">Filters</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow the list of projects.</DrawerDescription>
        <div className="mt-6 flex justify-end gap-2">
          <DrawerClose>Done</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderSide =
  (side: Side): NonNullable<Story["render"]> =>
  (args) => (
    <Drawer {...args}>
      <DrawerTrigger variant="secondary">Filters</DrawerTrigger>
      <DrawerContent side={side}>
        <DrawerTitle>Filters</DrawerTitle>
        {Array.from({ length: 60 }, (_, index) => (
          <DrawerDescription key={index}>Option {index + 1}</DrawerDescription>
        ))}
        <DrawerClose>Done</DrawerClose>
      </DrawerContent>
    </Drawer>
  );

const openDrawer = async (canvas: {
  getByRole: (role: string, options: { name: string }) => HTMLElement;
}) => {
  await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
  return expectVisible(() => screen.findByRole("dialog"));
};

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expectVisible(() => screen.findByRole("dialog", { name: "Filters" }));
  },
};

export const Left: Story = { render: renderSide("left") };

export const Right: Story = { render: renderSide("right") };

export const EscapeReturnsFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await openDrawer(canvas);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const CloseControl: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await openDrawer(canvas);
    await userEvent.click(await screen.findByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const OutsidePress: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await openDrawer(canvas);
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const FocusMovesIn: Story = {
  play: async ({ canvas }) => {
    const drawer = await openDrawer(canvas);
    await waitFor(() =>
      expect(drawer.contains(document.activeElement)).toBe(true),
    );
  },
};

export const NamedByTitle: Story = {
  play: async ({ canvas }) => {
    await openDrawer(canvas);
    await expect(
      await screen.findByRole("dialog", { name: "Filters" }),
    ).toHaveAccessibleDescription("Narrow the list of projects.");
  },
};

export const TouchTargets: Story = {
  play: async ({ canvas }) => {
    const floor = matchMedia("(any-pointer: coarse)").matches ? 44 : 0;
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await openDrawer(canvas);
    const close = await screen.findByRole("button", { name: "Done" });
    for (const control of [trigger, close]) {
      const box = control.getBoundingClientRect();
      await expect(box.width).toBeGreaterThanOrEqual(floor);
      await expect(box.height).toBeGreaterThanOrEqual(floor);
    }
  },
};

export const SwipeToDismiss: Story = {
  play: async ({ canvas }) => {
    const commands = await touchCommands();
    if (!commands) return;
    const drawer = await openDrawer(canvas);
    /* The sheet slides in after it turns visible; a swipe aimed at where it
     * is not yet would miss it. */
    await waitFor(() =>
      expect(drawer.getBoundingClientRect().bottom).toBeCloseTo(
        window.innerHeight - 16,
        0,
      ),
    );
    drawer.dataset["touchTarget"] = "";
    const { width } = drawer.getBoundingClientRect();
    await commands.swipe("[data-touch-target]", width / 2, 24, 0, 400);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

function insideSafeArea(side: Side): Story {
  return {
    render: renderSide(side),
    play: async ({ canvas }) => {
      await withInsets(async () => {
        await expectInsideInsets(await openDrawer(canvas));
      });
    },
  };
}

export const BottomInsideSafeArea: Story = insideSafeArea("bottom");
export const LeftInsideSafeArea: Story = insideSafeArea("left");
export const RightInsideSafeArea: Story = insideSafeArea("right");

function oneRemFromItsEdge(side: Side): Story {
  return {
    render: renderSide(side),
    play: async ({ canvas }) => {
      const drawer = await openDrawer(canvas);
      await waitFor(async () => {
        const box = drawer.getBoundingClientRect();
        const gap = {
          bottom: window.innerHeight - box.bottom,
          left: box.left,
          right: window.innerWidth - box.right,
        }[side];
        await expect(gap).toBeCloseTo(16, 0);
      });
    },
  };
}

export const BottomOneRemFromItsEdge: Story = oneRemFromItsEdge("bottom");
export const LeftOneRemFromItsEdge: Story = oneRemFromItsEdge("left");
export const RightOneRemFromItsEdge: Story = oneRemFromItsEdge("right");
