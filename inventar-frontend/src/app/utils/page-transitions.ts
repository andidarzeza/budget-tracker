import { Location } from '@angular/common';
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
 *
 * Only the push / pop into forms uses a real view transition; switching
 * between top-level pages is a non-blocking CSS slide (see `slideInNextPage`).
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

/**
 * View transitions are used on phones only. While one runs, the browser
 * freezes the page behind a snapshot: clicks are dropped and the cursor
 * falls back to the arrow. That is unnoticeable with a thumb but makes the
 * desktop sidebar miss quick clicks, so desktop gets a CSS fade instead
 * (styles.scss, `html.page-vt`).
 */
export function usePageViewTransitions(): boolean {
  const enabled = 'startViewTransition' in document && !isDesktop();
  document.documentElement.classList.toggle('page-vt', enabled);
  return enabled;
}

function isDesktop(): boolean {
  return window.matchMedia?.('(min-width: 768px)').matches ?? false;
}

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

  if (!direction || reduceMotion || isDesktop() || (nav?.trigger === 'popstate' && !appBack)) {
    transition.skipTransition();
    return;
  }

  const root = document.documentElement;

  // Between top-level pages (the tab bar, More) the slide is a plain CSS
  // animation on the incoming page instead: a view transition freezes the
  // page behind its snapshot while it runs, and iOS then drops taps — so a
  // quick second tap on the tab bar did nothing. The CSS slide never blocks
  // input, so tabs switch on every tap.
  if (path(from).length === path(to).length) {
    transition.skipTransition();
    slideInNextPage(root, direction);
    return;
  }

  // Into / out of a create or edit form: keep the view transition (both
  // pages move, and the form's fixed header / footer stay in place).
  root.dataset['pageTransition'] = direction;
  transition.finished.finally(() => delete root.dataset['pageTransition']);
}

let pageEnterTimer: ReturnType<typeof setTimeout> | null = null;

/** Mark the page about to be inserted so its CSS slide-in runs (styles.scss, `data-page-enter`). */
function slideInNextPage(root: HTMLElement, direction: Direction): void {
  root.dataset['pageEnter'] = direction;
  if (pageEnterTimer) clearTimeout(pageEnterTimer);
  // Removed once the animation is over, so nothing re-animates later.
  pageEnterTimer = setTimeout(() => {
    delete root.dataset['pageEnter'];
    pageEnterTimer = null;
  }, 450);
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

/**
 * Leave a routed form page (…/add, …/:id/edit).
 *
 *  - Saved: always end on the list. If the list is the page right behind
 *    this one, step back to it (history stays list → no duplicate);
 *    otherwise (e.g. opened from the dashboard's +) replace this page with
 *    the list.
 *  - Cancelled: just go back if there is somewhere in the app to go back to.
 */
export function leaveFormPage(router: Router, location: Location, listPath: string, saved: boolean): void {
  const navigationId = (location.getState() as { navigationId?: number } | null)?.navigationId ?? 1;
  const cameFrom = router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl?.toString().split(/[?#]/)[0];
  if (navigationId > 1 && (!saved || cameFrom === listPath)) {
    markInAppBack();
    location.back();
  } else {
    router.navigate([listPath], { replaceUrl: true });
  }
}
