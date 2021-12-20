import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';


const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule)},
  {path: 'dashboard', loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)},
  {path: 'expenses', loadChildren: () => import('./components/expenses/expenses.module').then(m => m.ExpensesModule)},
  {path: 'incomes', loadChildren: () => import('./components/incomes/incomes.module').then(m => m.IncomesModule)},
  {path: 'categories', loadChildren: () => import('./components/categories/categories.module').then(m => m.CategoriesModule)},
  {path: 'settings', loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule)},
  {path: '**', pathMatch: 'full', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
