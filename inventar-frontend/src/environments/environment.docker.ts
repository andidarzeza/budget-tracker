/**
 * Docker / VPS: nginx serves the SPA and proxies `/api/` to the Spring Boot service
 * (`backend:9000` on the Compose network). The browser uses relative URLs (`/api/...`)
 * on the same origin as the page (e.g. `http://YOUR_SERVER:4001`), so no CORS or
 * mixed-content issues for normal use.
 *
 * For a split deploy (SPA and API on different origins), rebuild with a full
 * `serverAPIURL` and set `CORS_ORIGIN` on the backend — see DOCKER.md.
 */
export const serverAPIURL = '';

export const environment = {
  production: true,
  experimentalMode: false
};

export const TOASTER_CONFIGURATION = {
  timeOut: 7000,
  positionClass: 'toast-bottom-right'
};

export const CREATE_DIALOG_DESKTOP_CONFIGURATION = {
  width: '800px',
  maxWidth: '96vw',
  maxHeight: '92vh',
  disableClose: true,
};

export const CREATE_DIALOG_MOBILE_CONFIGURATION = {
  width: '100vw',
  maxWidth: '100vw',
  height: '100vh',
  maxHeight: '100vh',
  disableClose: true,
};

export const CURRENCIES = ['ALL', 'EUR', 'USD', 'CAD', 'GBP'];

export const SIDEBAR_WIDTH = 250;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const PAGE_SIZE = 50;
