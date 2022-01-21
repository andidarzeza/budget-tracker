import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { AddSpendingComponent } from './add-spending/add-spending.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ExpensesRoutingModule } from './expenses-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [ExpensesComponent, AddSpendingComponent, ExpenseDetailComponent],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    SharedModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatNativeDateModule,
    MatMenuModule
  ]
})
export class ExpensesModule { }
