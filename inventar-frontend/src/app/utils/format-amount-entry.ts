/**
 * Keypad entry (digits + optional `.`) as shown while typing: thousands
 * separators in the whole part, the decimals exactly as typed (so a
 * trailing "." or "0" stays visible). "1234567.5" → "1,234,567.5".
 */
export function formatAmountEntry(entry: string): string {
  if (entry === '' || entry === '.') return '0';
  const [whole, decimals] = entry.split('.');
  const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}
