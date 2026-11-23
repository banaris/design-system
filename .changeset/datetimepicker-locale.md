---
"@banaris/design-system": minor
---

`DateTimePicker` accepts `locale` (a BCP 47 tag for month, weekday and day names; default `"en"`; a malformed tag, or one the runtime has no data for, falls back to it), `labels` (overrides for the popup's accessible names and text, with the English strings as defaults; the trigger's empty text stays `placeholder`) and `firstDayOfWeek` (`0`–`6`, `0` = Sunday; by default taken from the locale). `DateTimePickerLabels` is exported.
