import type { ProjectAnnotations, Renderer } from "storybook/internal/types";
import { expect } from "storybook/test";

/* iOS Safari zooms a focused field below 16px; the Select trigger is a button,
 * hence `[role="combobox"]`. */
const FIELDS = 'input, textarea, select, [role="combobox"]';
const NOT_TEXT_ENTRY =
  "hidden,checkbox,radio,range,button,submit,reset,image,file,color";
const COARSE_FLOOR_PX = 16;
const FINE_PX = 14;

const isTextEntry = (field: Element) =>
  field.closest('[aria-hidden="true"]') === null &&
  !(
    field instanceof HTMLInputElement &&
    NOT_TEXT_ENTRY.split(",").includes(field.type)
  );

export const fieldFontSize: ProjectAnnotations<Renderer> = {
  afterEach: async () => {
    const coarse = matchMedia("(any-pointer: coarse)").matches;
    for (const field of document.querySelectorAll(FIELDS)) {
      if (!isTextEntry(field)) continue;
      const size = parseFloat(getComputedStyle(field).fontSize);
      if (coarse) await expect(size).toBeGreaterThanOrEqual(COARSE_FLOOR_PX);
      // An unstyled native control (`FieldControl`) takes its size from the consumer.
      else if (field.classList.contains("text-input"))
        await expect(size).toBe(FINE_PX);
    }
  },
};
