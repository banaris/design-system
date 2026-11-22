---
"@banaris/design-system": minor
---

Let a vertical swipe that starts on a `Slider` scroll the page on touch screens: the control is now `touch-action: pan-y` instead of `none`, and a swipe that turns into a scroll no longer changes the value. On touch, tapping the track sets the value when the finger lifts, and a horizontal drag still moves the thumb. `Slider` is now a client component.
