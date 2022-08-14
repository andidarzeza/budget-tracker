import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { NotFoundComponent } from './shared/not-found/not-found.component';


const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule)},
  {path: 'register', loadChildren: () => import('./components/register/register.module').then(m => m.RegisterModule)},
  {path: 'dashboard', loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate : [AuthGuardService]},
  {path: 'account', loadChildren: () => import('./components/account/account.module').then(m => m.AccountModule), canActivate : [AuthGuardService]},
  {path: 'expenses', loadChildren: () => import('./components/expenses/expenses.module').then(m => m.ExpensesModule), canActivate : [AuthGuardService]},
  {path: 'incomes', loadChildren: () => import('./components/incomes/incomes.module').then(m => m.IncomesModule), canActivate : [AuthGuardService]},
  {path: 'categories', loadChildren: () => import('./components/categories/categories.module').then(m => m.CategoriesModule), canActivate : [AuthGuardService]},
  {path: 'settings', loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule), canActivate : [AuthGuardService]},
  {path: 'history', loadChildren: () => import('./components/history/history.module').then(m => m.HistoryModule), canActivate : [AuthGuardService]},
  {path: '**', pathMatch: 'full', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
