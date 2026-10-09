import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { onPageTransition } from './utils/page-transitions';
import { AuthGuardService } from './services/auth-guard.service';
import { CustomHttpInterceptorService } from './services/custom-http-interceptor.service';
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
    // New pages open at the top (no jump from the previous page's scroll);
    // going back restores where you were in the list.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Pages slide in from their side, like the dashboard tabs (see utils/page-transitions).
      withViewTransitions({ onViewTransitionCreated: onPageTransition }),
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptorService,
      multi: true,
    },
    provideToastr(),
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
