import { expect } from "storybook/test";

const REDUCE = "(prefers-reduced-motion: reduce)";

/* Read from the stylesheet: the test browser does not ask for reduced motion,
 * so the computed style alone never exercises that branch. */
function reducedMotionStops(element: Element) {
  const stops: CSSRule[] = [];
  const visit = (rule: CSSRule, reduced: boolean, selector: string | null) => {
    if (rule instanceof CSSMediaRule) {
      reduced ||= rule.conditionText.includes("prefers-reduced-motion: reduce");
    } else if (rule instanceof CSSStyleRule) {
      selector = rule.selectorText;
    }
    if (
      reduced &&
      selector !== null &&
      (rule instanceof CSSStyleRule || rule instanceof CSSNestedDeclarations) &&
      rule.style.animationName === "none" &&
      element.matches(selector)
    ) {
      stops.push(rule);
    }
    if (rule instanceof CSSGroupingRule) {
      for (const inner of rule.cssRules) {
        visit(inner, reduced, selector);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) visit(rule, false, null);
  }
  return stops;
}

export async function expectSpinsUnlessReduced(element: Element | null) {
  await expect(element).not.toBeNull();
  if (element === null) return;
  await expect(reducedMotionStops(element).length).toBeGreaterThan(0);
  await expect(getComputedStyle(element).animationName).toBe(
    matchMedia(REDUCE).matches ? "none" : "ds-spin",
  );
}
