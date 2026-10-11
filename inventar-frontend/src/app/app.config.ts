import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { hookToastFeedback } from './utils/toast-feedback';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PreloadAllModules, provideRouter, Routes, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { onPageTransition, usePageViewTransitions } from './utils/page-transitions';
import { AuthGuardService } from './services/auth-guard.service';
import { CustomHttpInterceptorService } from './services/custom-http-interceptor.service';
import { ListCacheInterceptor } from './core/services/list-cache.interceptor';
import { WarmCacheInterceptor } from './core/services/warm-cache.interceptor';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
    data: { animation: 'loginPage' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./components/welcome/welcome.component').then((m) => m.WelcomeComponent),
    canActivate: [AuthGuardService],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuardService],
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./components/account/account.component').then((m) => m.AccountComponent),
    canActivate: [AuthGuardService],
    data: { animation: 'accountPage' },
  },
  {
    path: 'expenses',
    loadChildren: () =>
      import('./components/expenses/expenses.routes').then((m) => m.EXPENSES_ROUTES),
    canActivate: [AuthGuardService],
  },
  {
    path: 'incomes',
    loadChildren: () =>
      import('./components/incomes/incomes.routes').then((m) => m.INCOMES_ROUTES),
    canActivate: [AuthGuardService],
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./components/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
    canActivate: [AuthGuardService],
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./components/projects/projects.routes').then((m) => m.PROJECTS_ROUTES),
    canActivate: [AuthGuardService],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [AuthGuardService],
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/history/history.component').then((m) => m.HistoryComponent),
    canActivate: [AuthGuardService],
  },
  {
    path: 'exchange',
    loadComponent: () =>
      import('./components/exchange/exchange.component').then((m) => m.ExchangeComponent),
    canActivate: [AuthGuardService],
  },
  { path: '**', pathMatch: 'full', component: NotFoundComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless: no zone.js patching every timer, promise and event. Angular
    // re-renders only what signals, template events or markForCheck() flag
    // (every component is OnPush).
    provideZonelessChangeDetection(),
    // New pages open at the top (no jump from the previous page's scroll);
    // going back restores where you were in the list.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Download every page's code in the background after start-up, so the
      // first tap on a tab never waits for its chunk.
      withPreloading(PreloadAllModules),
      // Phones: pages slide in from their side, like the dashboard tabs (see
      // utils/page-transitions). Desktop uses a plain CSS fade instead.
      ...(usePageViewTransitions() ? [withViewTransitions({ onViewTransitionCreated: onPageTransition })] : []),
    ),
    // The animations engine is loaded after the first render instead of in
    // the start-up bundle.
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptorService,
      multi: true,
    },
    // Keeps the prefetched Expenses / Incomes lists fresh after saves.
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ListCacheInterceptor,
      multi: true,
    },
    // Summary page data answered from memory first, then refreshed.
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WarmCacheInterceptor,
      multi: true,
    },
    provideToastr(),
    // Haptic (and optional sound) feedback for every success / warning / error toast.
    provideAppInitializer(hookToastFeedback),
    // CDK 21 puts dialogs/menus in the browser's top layer (popover API),
    // which sits above any z-index — toasts would end up hidden behind an
    // open dialog. Keep overlays in the normal stacking order instead.
    { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } },
    // Material datepickers (dashboard pickers, expense/income date input) need
    // a DateAdapter from the environment injector — providing it once here
    // avoids per-component MatNativeDateModule plumbing.
    provideNativeDateAdapter(),
  ],
};
