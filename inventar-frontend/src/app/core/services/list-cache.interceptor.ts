import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ListCacheService } from './list-cache.service';

/** Writes to these change what the cached Expenses / Incomes pages show
 *  (a wallet balance edit books the difference as an income / expense). */
const TRACKED = /\/api\/(expense|income|categories|wallets)(\/|\?|$)/;

/**
 * After a successful add / edit / delete of an expense, income or category
 * (from any screen), tells `ListCacheService` to refetch, so the lists are
 * already up to date when the user opens them.
 */
@Injectable({ providedIn: 'root' })
export class ListCacheInterceptor implements HttpInterceptor {
  // Resolved lazily: the cache service itself uses HttpClient.
  private readonly injector = inject(Injector);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.method === 'GET' || !TRACKED.test(request.url)) return next.handle(request);
    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && event.ok) {
          this.injector.get(ListCacheService).onMutation();
        }
      }),
    );
  }
}
