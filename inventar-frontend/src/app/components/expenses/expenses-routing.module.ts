import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpensesComponent } from './expenses.component';


const routes: Routes = [
  { path: '', component: ExpensesComponent },
  // Mobile create flow renders as a routed page (sticky header + native body
  // scroll + sticky footer). Desktop continues to use the dialog.
  { path: 'add', component: AddExpenseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
