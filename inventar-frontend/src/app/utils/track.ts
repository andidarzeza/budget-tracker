/**
 * `trackBy` helpers for `*ngFor`. Without one, Angular re-creates every row
 * whenever the list is replaced by a new array (each refresh), instead of
 * keeping the rows whose item didn't change.
 */

/** Records with an id (expenses, categories, wallets, accounts…). */
export function trackById(_: number, item: { id?: unknown } | null | undefined): unknown {
  return item?.id ?? item;
}

/** Table column definitions. */
export function trackByColumn(_: number, column: { column: string }): string {
  return column.column;
}

/** Plain values (strings, numbers) and objects keyed by a label. */
export function trackByValue(_: number, value: unknown): unknown {
  return (value as { label?: unknown })?.label ?? value;
}
