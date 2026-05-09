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
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
