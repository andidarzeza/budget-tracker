import { inject } from '@angular/core';
import { Router, ViewTransitionInfo } from '@angular/router';

/**
 * Page transitions (View Transitions API, via the router's
 * `withViewTransitions`). Pages slide in from the side they "sit" on, the
 * same motion as the dashboard's Statistics ⇄ Balances tabs:
 *
 *  - tabs are ordered Home · Summary · Expenses · Incomes · More pages, so
 *    moving right slides in from the right and moving left from the left;
 *  - deeper pages (…/add, …/:id/edit) push in from the right, and leaving
 *    them slides back from the left.
 *
 * The browser's own swipe-back already animates, so plain history (popstate)
 * navigations are not animated — except the app's own ‹ / Done buttons,
 * which call `markInAppBack()` first.
 */

/** Tab order used to pick the slide direction between top-level pages. */
const PAGE_ORDER: Record<string, number> = {
  welcome: 0,
  dashboard: 1,
  expenses: 2,
  incomes: 3,
};
/** Pages reached from "More" (categories, projects, settings, …). */
const MORE_RANK = 4;

let inAppBack = false;

/** Call right before `location.back()` from an in-app back button. */
export function markInAppBack(): void {
  inAppBack = true;
}

type Direction = 'forward' | 'back';

export function onPageTransition({ transition }: ViewTransitionInfo): void {
  const router = inject(Router);
  const nav = router.currentNavigation();
  const appBack = inAppBack;
  inAppBack = false;

  const from = nav?.previousNavigation?.finalUrl?.toString() ?? '';
  const to = (nav?.finalUrl ?? nav?.extractedUrl)?.toString() ?? '';
  const direction = from ? directionBetween(path(from), path(to)) : null;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!direction || reduceMotion || (nav?.trigger === 'popstate' && !appBack)) {
    transition.skipTransition();
    return;
  }

  const root = document.documentElement;
  root.dataset['pageTransition'] = direction;
  transition.finished.finally(() => delete root.dataset['pageTransition']);
}

function path(url: string): string[] {
  return url.split(/[?#]/)[0].split('/').filter(Boolean);
}

function directionBetween(from: string[], to: string[]): Direction | null {
  if (from.join('/') === to.join('/')) return null;
  // Into a detail page (add / edit) = push; out of one = pop.
  if (to.length !== from.length) return to.length > from.length ? 'forward' : 'back';
  const rank = (segments: string[]) => PAGE_ORDER[segments[0]] ?? MORE_RANK;
  const a = rank(from);
  const b = rank(to);
  if (a === b) return 'forward';
  return b > a ? 'forward' : 'back';
}
