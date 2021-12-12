import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookTableComponent } from './components/book-table/book-table.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { CilesimetComponent } from './components/cilesimet/cilesimet.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SpendingsComponent } from './components/spendings/spendings.component';


const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'librat', component: BookTableComponent},
  {path: 'categories', component: CategoriesComponent},
  {path: 'cilesimet', component: CilesimetComponent},
  {path: 'spendings', component: SpendingsComponent},
  {path: 'dashboard', component: DashboardComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
