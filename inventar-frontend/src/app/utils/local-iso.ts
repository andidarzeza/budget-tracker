/**
 * Pick the timestamp to save for a date-picker entry:
 *   • Today  → actual current wall-clock (timeline ordering stays correct).
 *   • Other  → local noon (DST-safe; midnight can drift to the previous day
 *              after a UTC conversion in some zones).
 */
export function pickEntryTimestamp(picked: Date): Date {
  const now = new Date();
  const isToday =
    picked.getFullYear() === now.getFullYear() &&
    picked.getMonth() === now.getMonth() &&
    picked.getDate() === now.getDate();
  return isToday
    ? now
    : new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), 12, 0, 0);
}

/**
 * Format `picked` as a bare local-zone ISO 8601 wall-clock string
 * (`yyyy-MM-ddTHH:mm:ss`, **no offset**) — the format Jackson's
 * `LocalDateTime` deserializer accepts.
 *
 * Why no offset: Jackson's `LocalDateTimeDeserializer` rejects an offset
 * suffix (`+02:00` / `Z`) outright, since offsets belong to
 * `OffsetDateTime`. Without an offset, `LocalDateTime` keeps the digits as
 * a wall-clock — which is exactly what the user picked.
 *
 * Use for backends that store the field as `java.time.LocalDateTime`
 * (currently: `Expense.createdTime`).
 */
export function toBareLocalIso(picked: Date): string {
  const d = pickEntryTimestamp(picked);
  return formatLocalDateTime(d);
}

/**
 * Format an existing `Date` as a bare local ISO 8601 wall-clock string
 * (`yyyy-MM-ddTHH:mm:ss`, **no offset**) — same format as `toBareLocalIso`
 * but **without** the noon-snap from `pickEntryTimestamp`. Use when you
 * already have a precise local timestamp you want preserved verbatim.
 */
export function formatLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/**
 * Format a `Date` as an ISO 8601 instant (`…Z`, UTC) whose digits match
 * the source's **local wall-clock** — i.e. take year/month/day/hour/min/sec
 * from the local Date and emit them as if they were UTC. Day-18 local
 * midnight becomes `2026-05-18T00:00:00.000Z` regardless of the runtime
 * timezone, instead of `Date.toISOString()`'s default which shifts by the
 * local UTC offset.
 *
 * Why this exists: the backend stores `Expense.createdTime` as
 * `LocalDateTime` (no zone — see `toBareLocalIso`) but the dashboard
 * query endpoints expect an `Instant` (`…Z`). Naively calling
 * `Date.toISOString()` on the picker's boundaries shifts the comparison
 * window by the local UTC offset, so an expense at 22:34 local on the
 * 18th lands under day-19's filter. Sending the picker's wall-clock as
 * UTC-tagged ISO keeps both sides of the comparison on the same clock.
 */
export function toLocalAsUtcIso(d: Date): string {
  const utc = new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
    ),
  );
  return utc.toISOString();
}
