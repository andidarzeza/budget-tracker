import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';

/** One expense or income matched by `/api/search`. */
export interface SearchHit {
  id: string;
  type: 'EXPENSE' | 'INCOME';
  description: string | null;
  categoryId: string | null;
  category: string | null;
  icon: string | null;
  amount: number;
  currency: string;
  /** Epoch millis. */
  date: number | null;
}

export interface SearchResult {
  expenses: SearchHit[];
  incomes: SearchHit[];
}

/**
 * The app-wide search (Spotlight). Opened from the sidebar's search field,
 * ⌘K, or the search button in the phone nav bar; rendered once by the shell.
 */
@Injectable({ providedIn: 'root' })
export class SpotlightService {
  private readonly http = inject(HttpClient);

  readonly isOpen = signal(false);
  /** Text to start with (e.g. what was already typed in the sidebar field). */
  readonly initialQuery = signal('');

  /** Stand-in field focused during the tap that opens Spotlight (see `open`). */
  private keyboardProxy: HTMLInputElement | null = null;

  open(query = ''): void {
    this.primeKeyboard();
    this.initialQuery.set(query);
    this.isOpen.set(true);
  }

  close(): void {
    this.releaseKeyboard();
    this.isOpen.set(false);
  }

  /**
   * iOS only raises the keyboard for a focus() made during the tap itself,
   * but Spotlight's field doesn't exist until the next render. So focus a
   * hidden input right now; when the real field takes focus a moment later
   * the keyboard is already up and simply stays.
   */
  private primeKeyboard(): void {
    if (this.keyboardProxy) return;
    const proxy = document.createElement('input');
    proxy.type = 'text';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.tabIndex = -1;
    // 16px so iOS doesn't zoom; off-screen but still focusable.
    proxy.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;pointer-events:none;';
    document.body.appendChild(proxy);
    proxy.focus({ preventScroll: true });
    this.keyboardProxy = proxy;
  }

  /** Called once Spotlight's own field has focus. */
  releaseKeyboard(): void {
    this.keyboardProxy?.remove();
    this.keyboardProxy = null;
  }

  /** Latest expenses and incomes whose description, category or amount matches. */
  search(account: string, q: string, limit = 6): Observable<SearchResult> {
    const params = new HttpParams().append('account', account).append('q', q).append('limit', limit);
    return this.http.get<SearchResult>(`${serverAPIURL}/api/search`, { params });
  }
}
