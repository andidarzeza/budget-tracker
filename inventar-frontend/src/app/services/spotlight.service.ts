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
 * The app-wide search (Spotlight), desktop only. Opened from the sidebar's
 * search field or ⌘K; rendered once by the shell.
 */
@Injectable({ providedIn: 'root' })
export class SpotlightService {
  private readonly http = inject(HttpClient);

  readonly isOpen = signal(false);
  /** Text to start with (e.g. what was already typed in the sidebar field). */
  readonly initialQuery = signal('');

  open(query = ''): void {
    this.initialQuery.set(query);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /** Latest expenses and incomes whose description, category or amount matches. */
  search(account: string, q: string, limit = 6): Observable<SearchResult> {
    const params = new HttpParams().append('account', account).append('q', q).append('limit', limit);
    return this.http.get<SearchResult>(`${serverAPIURL}/api/search`, { params });
  }
}
