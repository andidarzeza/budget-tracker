import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncomesComponent } from './incomes.component';


const routes: Routes = [{
  path: '', component: IncomesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomesRoutingModule { }
