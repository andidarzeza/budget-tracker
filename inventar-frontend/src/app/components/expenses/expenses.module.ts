import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import { AddExpenseModule } from './add-expense/add-expense.module';
import { BaseTableModule } from 'src/app/shared/base-table/base-table.module';
import { ExpenseDetailModule } from './expense-detail/expense-detail.module';



@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    MatDialogModule,
    SharedModule,
    MatSidenavModule,  
    BaseTableModule,
    MatMenuModule,
    AddExpenseModule,
    ExpenseDetailModule
  ]
})
export class ExpensesModule { }
