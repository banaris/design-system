import { Slider as BaseSlider } from "@base-ui/react/slider";

import { TRANSITION_INTERACTIVE } from "../lib/class-presets";
import { cn } from "../lib/cn";

export type SliderProps = Omit<
  BaseSlider.Root.Props<number>,
  | "className"
  | "render"
  | "children"
  | "orientation"
  | "thumbAlignment"
  | "thumbCollisionBehavior"
  | "minStepsBetweenValues"
> & {
  className?: string;
  "aria-label"?: string | undefined;
};

/** A single-value slider; name it with `aria-label`, `aria-labelledby` or a `Field` label. */
export function Slider({
  className,
  "aria-label": ariaLabel,
  ...rest
}: SliderProps) {
  return (
    <BaseSlider.Root
      className={cn(
        "box-border w-full data-disabled:cursor-not-allowed",
        className,
      )}
      thumbAlignment="edge"
      {...rest}
    >
      <BaseSlider.Control className="flex h-6 w-full cursor-pointer touch-pan-y items-center select-none data-disabled:cursor-not-allowed">
        <BaseSlider.Track className="rounded-pill border-control-border bg-surface-sunken data-invalid:not-data-disabled:border-danger box-border h-1.5 w-full border border-solid data-disabled:border-transparent">
          <BaseSlider.Indicator className="rounded-pill bg-fill data-disabled:bg-ink-faint forced-colors:bg-[Highlight] data-disabled:forced-colors:bg-[GrayText]" />
          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className={cn(
              "rounded-pill bg-fill data-disabled:bg-ink-faint has-focus-visible:shadow-focus box-border size-5 outline-none has-focus-visible:z-10 has-focus-visible:outline-hidden forced-colors:bg-[CanvasText] data-disabled:forced-colors:bg-[GrayText]",
              TRANSITION_INTERACTIVE,
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
