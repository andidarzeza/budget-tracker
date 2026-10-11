import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';
import { WARM_REFRESH, WARM_URL, WarmCacheService } from './warm-cache.service';

/**
 * For the Summary page's GETs (see `WarmCacheService`): reply with the stored
 * response straight away, then with the server's — but only if it changed.
 * With nothing stored yet, the request just goes through (and is stored).
 */
@Injectable({ providedIn: 'root' })
export class WarmCacheInterceptor implements HttpInterceptor {
  // Lazy: the cache service uses HttpClient itself.
  private readonly injector = inject(Injector);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.method !== 'GET' || !WARM_URL.test(request.url)) return next.handle(request);

    const cache = this.injector.get(WarmCacheService);
    const key = request.urlWithParams;
    cache.remember(key);
    const cached = request.context.get(WARM_REFRESH) ? undefined : cache.get(key);

    const fresh$ = next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && event.ok) cache.put(key, event);
      }),
    );
    if (!cached) return fresh$;

    const cachedBody = JSON.stringify(cached.body);
    return concat(
      of(cached.clone()),
      fresh$.pipe(
        // Nothing new: don't make the page re-render.
        filter((event) => !(event instanceof HttpResponse) || JSON.stringify(event.body) !== cachedBody),
        // The page already shows data; a failed refresh just keeps it.
        catchError(() => EMPTY),
      ),
    );
  }
}
