/**
 * Docker / VPS: SPA is served on HTTP_PORT (e.g. 4001), API on BACKEND_PORT (default 9000).
 * Must match BACKEND_PORT in docker-compose / .env (default 9000).
 */
const DOCKER_API_PORT = 9000;

function resolveDockerApiOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${DOCKER_API_PORT}`;
}

/**
 * Full origin for Spring Boot (e.g. http://31.97.79.96:9000).
 * Set CORS_ORIGIN on the backend to this SPA origin (e.g. http://31.97.79.96:4001).
 */
export const serverAPIURL = resolveDockerApiOrigin();

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
