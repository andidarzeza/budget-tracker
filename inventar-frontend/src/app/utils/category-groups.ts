import { Category } from '../models/models';

/** How many categories the "Most used" group shows at most. */
const MOST_USED_MAX = 5;

export interface CategoryGroup {
  /** Section header, or null when the list isn't split. */
  label: string | null;
  items: Category[];
}

/**
 * Split a picker's categories (already sorted most-used first by the
 * by-usage endpoint) into "Most used" — up to five that have been used —
 * and the rest, alphabetically. No split when nothing has been used yet or
 * everything would land in the first group.
 */
export function groupCategoriesByUsage(categories: Category[]): CategoryGroup[] {
  const mostUsed = categories.filter((c) => (c.usageCount ?? 0) > 0).slice(0, MOST_USED_MAX);
  if (!mostUsed.length || mostUsed.length === categories.length) {
    return [{ label: null, items: categories }];
  }
  const rest = categories
    .filter((c) => !mostUsed.includes(c))
    .sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '', undefined, { sensitivity: 'base' }));
  return [
    { label: 'Most used', items: mostUsed },
    { label: 'Other categories', items: rest },
  ];
}
