/**
 * Docker / VPS: browser calls the API on the same origin as the SPA (`/api/...`).
 * The web container’s nginx proxies `/api` to the backend service (see nginx.conf).
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
