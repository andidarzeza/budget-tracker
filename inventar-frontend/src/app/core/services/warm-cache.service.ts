import { HttpClient, HttpContext, HttpContextToken, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

/** Requests whose responses are kept warm: the Summary page's data, and the
 *  add expense / income category pickers (so those forms open ready). */
export const WARM_URL = /\/api\/(dashboard|wallets|projects|categories\/by-usage)(\?|$)/;

/** Set on the cache's own refresh requests: always go to the server. */
export const WARM_REFRESH = new HttpContextToken<boolean>(() => false);

/** Most recent warm request addresses, remembered across app starts. */
const KEYS_STORAGE = 'warm-cache.keys';
const MAX_KEYS = 16;

/**
 * Stale-while-revalidate store for the Summary page's GET requests (period
 * totals, this / last month, sources, projects). `WarmCacheInterceptor`
 * answers a request with the stored response at once and then with the
 * server's, only if it changed. `ListCacheService` calls `refresh()` with
 * its Expenses / Incomes prefetch (sign-in, every minute, on resume, after
 * saves), so the Summary always opens with data.
 *
 * Responses live in memory only; just the request addresses are kept in
 * localStorage, so the next app start can warm them up before the page is
 * opened.
 */
@Injectable({ providedIn: 'root' })
export class WarmCacheService {
  private readonly http = inject(HttpClient);
  private readonly store = new Map<string, HttpResponse<unknown>>();

  get(key: string): HttpResponse<unknown> | undefined {
    return this.store.get(key);
  }

  put(key: string, response: HttpResponse<unknown>): void {
    this.store.set(key, response);
  }

  /** Remember a request so later refreshes (and app starts) fetch it too. */
  remember(key: string): void {
    const keys = [key, ...this.keys().filter((k) => k !== key)].slice(0, MAX_KEYS);
    try {
      localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
    } catch {
      /* storage unavailable: refreshes then cover this session only */
    }
  }

  /** Refetch every remembered request for this account. */
  refresh(account: string): void {
    const marker = `account=${encodeURIComponent(account)}`;
    for (const key of this.keys()) {
      if (!key.includes(marker)) continue;
      this.http
        .get(key, { context: new HttpContext().set(WARM_REFRESH, true) })
        .subscribe({ error: () => {} });
    }
  }

  /** Forget stored responses whose address matches (keeps them remembered for refresh). */
  drop(pattern: RegExp): void {
    for (const key of [...this.store.keys()]) {
      if (pattern.test(key)) this.store.delete(key);
    }
  }

  /** Sign-out: forget everything. */
  clear(): void {
    this.store.clear();
    try {
      localStorage.removeItem(KEYS_STORAGE);
    } catch {
      /* ignore */
    }
  }

  private keys(): string[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEYS_STORAGE) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : [];
    } catch {
      return [];
    }
  }
}
