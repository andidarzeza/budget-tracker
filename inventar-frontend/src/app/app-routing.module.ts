import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CilesimetComponent } from './components/cilesimet/cilesimet.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IncomingsComponent } from './components/incomings/incomings.component';
import { SpendingsComponent } from './components/spendings/spendings.component';


const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'categories', component: CategoriesComponent},
  {path: 'cilesimet', component: CilesimetComponent},
  {path: 'spendings', component: SpendingsComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'incomings', component: IncomingsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
