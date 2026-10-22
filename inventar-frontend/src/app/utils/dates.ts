/** Local midnight of the same day. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Local midnight of the Monday that starts `d`'s week. */
export function startOfWeek(d: Date): Date {
  const start = startOfDay(d);
  const offset = (start.getDay() + 6) % 7; // days since Monday (getDay: 0 = Sun)
  start.setDate(start.getDate() - offset);
  return start;
}

export function shiftDays(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
}

/** Ledger section heading: "TODAY", "YESTERDAY", else "MON, OCT 20". */
export function dayLabel(date: Date): string {
  const diffDays = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}
