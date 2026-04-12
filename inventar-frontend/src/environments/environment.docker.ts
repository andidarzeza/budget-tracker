/**
 * Used for container / reverse-proxy deployments (same origin as the API).
 * Nginx (or another proxy) forwards `/api/*` to the Spring Boot service.
 */
export const environment = {
  production: true,
  experimentalMode: false
};

/** Empty: browser calls `/api/...` on the same host as the static app. */
export const serverAPIURL = '';

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
