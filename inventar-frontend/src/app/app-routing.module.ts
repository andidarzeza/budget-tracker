import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IncomesComponent } from './components/incomes/incomes.component';
import { ExpensesComponent } from './components/expenses/expenses.component';


const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'categories', component: CategoriesComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'expenses', component: ExpensesComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'incomes', component: IncomesComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
