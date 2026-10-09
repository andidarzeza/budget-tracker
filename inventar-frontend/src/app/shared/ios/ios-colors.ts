/**
 * iOS system colours. Row icon tiles snap a category's hash hue to the
 * nearest of these and draw a white glyph on top, like the solid coloured
 * squares in iOS Settings and Wallet.
 */
const IOS_SYSTEM_COLORS: ReadonlyArray<{ hue: number; color: string }> = [
  { hue: 3, color: '#ff3b30' },   // red
  { hue: 35, color: '#ff9500' },  // orange
  { hue: 48, color: '#ffcc00' },  // yellow
  { hue: 135, color: '#34c759' }, // green
  { hue: 175, color: '#00c7be' }, // mint
  { hue: 190, color: '#30b0c7' }, // teal
  { hue: 200, color: '#32ade6' }, // cyan
  { hue: 211, color: '#007aff' }, // blue
  { hue: 241, color: '#5856d6' }, // indigo
  { hue: 283, color: '#af52de' }, // purple
  { hue: 349, color: '#ff2d55' }, // pink
];

/** Solid tile background for a hue (0–360). */
export function iosTileColor(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  let best = IOS_SYSTEM_COLORS[0];
  let bestDist = 360;
  for (const c of IOS_SYSTEM_COLORS) {
    const d = Math.min(Math.abs(c.hue - h), 360 - Math.abs(c.hue - h));
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best.color;
}

/** Glyph colour on a solid tile. */
export const IOS_TILE_GLYPH = '#ffffff';

/**
 * Tile colour for a category name — the same hash and hue palette the
 * mobile ledgers use, so a category has one colour everywhere.
 */
export function iosTileColorForName(name: string | null | undefined): string {
  if (!name) return iosTileColor(215);
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const palette = [32, 215, 340, 270, 145, 8, 195];
  return iosTileColor(palette[Math.abs(hash) % palette.length]);
}
