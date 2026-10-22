// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

// LOCALHOST
export const serverAPIURL = '/api';

export const TOASTER_CONFIGURATION = {
  timeOut: 7000, 
  positionClass: 'toast-bottom-right'
}

export const CREATE_DIALOG_DESKTOP_CONFIGURATION = {
  width: '560px', // Apple form-sheet width
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

export const CURRENCIES = ["ALL", "EUR", "USD", "CAD", "GBP"];

// Pagination Options
export const PAGE_SIZE = 50;
