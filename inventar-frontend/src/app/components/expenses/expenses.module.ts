import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import { AddExpenseModule } from './add-expense/add-expense.module';
import { BaseTableModule } from 'src/app/shared/base-table/base-table.module';
import { ExpenseDetailModule } from './expense-detail/expense-detail.module';
import { QrScannerDialogComponent } from './qr-scanner-dialog/qr-scanner-dialog.component';



@NgModule({
  declarations: [ExpensesComponent, QrScannerDialogComponent],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    MatSidenavModule,  
    BaseTableModule,
    MatMenuModule,
    AddExpenseModule,
    ExpenseDetailModule
  ]
})
export class ExpensesModule { }
