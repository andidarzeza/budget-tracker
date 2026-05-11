import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
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
  { path: '**', pathMatch: 'full', component: NotFoundComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptorService,
      multi: true,
    },
    provideToastr(),
    // Material datepickers (dashboard pickers, expense/income date input) need
    // a DateAdapter from the environment injector — providing it once here
    // avoids per-component MatNativeDateModule plumbing.
    provideNativeDateAdapter(),
  ],
};
