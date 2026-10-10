import { HttpParams } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat, EMPTY, Observable, of, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CategoryType, ResponseWrapper } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { ExpenseService } from 'src/app/services/pages/expense.service';
import { IncomeService } from 'src/app/services/pages/income.service';
import { buildParams } from 'src/app/utils/param-bulder';
import { PAGE_SIZE } from 'src/environments/environment';

/** Background refresh while the app is open and visible. */
const REFRESH_EVERY_MS = 60_000;
/** Coming back to the app (PWA resume, tab focus) refreshes if older than this. */
const RESUME_REFRESH_AFTER_MS = 15_000;
/** Saves often come in bursts (expense + balance); refresh once after them. */
const MUTATION_DEBOUNCE_MS = 300;

/** Default list order, the same as the Expenses / Incomes pages. */
export const LEDGER_SORT = 'createdTime,desc';

/**
 * Keeps the first page of Expenses and Incomes (and their category lists)
 * ready in memory, so opening those pages shows data instantly.
 *
 *  - Prefetched on sign-in, then every minute while the app is visible,
 *    when the app comes back to the foreground, and right after any
 *    expense / income / category is added, edited or deleted.
 *  - List pages read it on their first load (`BaseTable.query`) and still
 *    fetch fresh data in the background; every page-0, unfiltered response
 *    they get is written back here.
 *  - Cleared on sign-out, so another user never sees the previous one's data.
 *
 * Keys are the request URL + query string, so a different account, filter,
 * sort or page simply doesn't match.
 */
@Injectable({ providedIn: 'root' })
export class ListCacheService {
  private readonly auth = inject(AuthenticationService);
  private readonly accountService = inject(AccountService);
  private readonly expenseService = inject(ExpenseService);
  private readonly incomeService = inject(IncomeService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly store = new Map<string, ResponseWrapper>();
  private readonly updates = new Subject<string>();
  /** Emits a key whenever its cached value changes. */
  readonly updated$ = this.updates.asObservable();

  private started = false;
  private interval: ReturnType<typeof setInterval> | null = null;
  private mutationTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPrefetch = 0;

  static key(url: string, params: HttpParams): string {
    return `${url}?${params.toString()}`;
  }

  get(key: string): ResponseWrapper | null {
    return this.store.get(key) ?? null;
  }

  put(key: string, value: ResponseWrapper): void {
    const previous = this.store.get(key);
    this.store.set(key, value);
    if (!previous || !sameResponse(previous, value)) this.updates.next(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Call once at app start. */
  start(): void {
    if (this.started) return;
    this.started = true;

    this.auth.currentUser.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      if (user) {
        this.prefetch();
        this.startTimer();
      } else {
        this.stopTimer();
        this.clear();
      }
    });

    const onResume = () => {
      if (document.visibilityState === 'visible' && Date.now() - this.lastPrefetch > RESUME_REFRESH_AFTER_MS) {
        this.prefetch();
      }
    };
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('focus', onResume);
    window.addEventListener('online', onResume);
    this.destroyRef.onDestroy(() => {
      this.stopTimer();
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('focus', onResume);
      window.removeEventListener('online', onResume);
    });
  }

  /** Something was added / edited / deleted: drop stale copies and refetch. */
  onMutation(): void {
    this.clear();
    if (this.mutationTimer) clearTimeout(this.mutationTimer);
    this.mutationTimer = setTimeout(() => {
      this.mutationTimer = null;
      this.prefetch();
    }, MUTATION_DEBOUNCE_MS);
  }

  /** Category list for a ledger page: the cached copy first (if any), then fresh. */
  categories(type: CategoryType): Observable<ResponseWrapper> {
    const account = this.accountService.getAccount();
    if (!account) return EMPTY;
    const params = categoryParams(type, account);
    const key = ListCacheService.key(this.categoriesService.API_URl, params);
    const fresh$ = this.categoriesService.findAll(params).pipe(tap((res: ResponseWrapper) => this.put(key, res)));
    const cached = this.get(key);
    return cached ? concat(of(cached), fresh$) : fresh$;
  }

  private prefetch(): void {
    const account = this.accountService.getAccount();
    if (!account || !this.auth.getToken()) return;
    this.lastPrefetch = Date.now();

    const firstPage = buildParams(0, PAGE_SIZE, LEDGER_SORT).append('account', account);
    this.load(this.expenseService.API_URl, firstPage, () => this.expenseService.findAll(firstPage));
    this.load(this.incomeService.API_URl, firstPage, () => this.incomeService.findAll(firstPage));
    for (const type of [CategoryType.EXPENSE, CategoryType.INCOME]) {
      const params = categoryParams(type, account);
      this.load(this.categoriesService.API_URl, params, () => this.categoriesService.findAll(params));
    }
  }

  private load(url: string, params: HttpParams, request: () => Observable<ResponseWrapper>): void {
    const key = ListCacheService.key(url, params);
    // Errors are ignored: the page itself will load (and report) normally.
    request().subscribe({ next: (res) => this.put(key, res), error: () => {} });
  }

  private startTimer(): void {
    if (this.interval) return;
    this.interval = setInterval(() => {
      if (document.visibilityState === 'visible') this.prefetch();
    }, REFRESH_EVERY_MS);
  }

  private stopTimer(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

/** The exact params the Expenses / Incomes pages use for their category lists. */
function categoryParams(type: CategoryType, account: string): HttpParams {
  return buildParams(0, 9999).append('categoryType', type).append('account', account);
}

export function sameResponse(a: ResponseWrapper | null | undefined, b: ResponseWrapper | null | undefined): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
