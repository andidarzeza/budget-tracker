import { Routes } from '@angular/router';
import { AddIncomeComponent } from './add-income/add-income.component';
import { IncomesComponent } from './incomes.component';

export const INCOMES_ROUTES: Routes = [
  { path: '', component: IncomesComponent },
  // Mobile create flow renders as a routed page (sticky header + native body
  // scroll + sticky footer). Desktop continues to use the dialog.
  { path: 'add', component: AddIncomeComponent },
];
