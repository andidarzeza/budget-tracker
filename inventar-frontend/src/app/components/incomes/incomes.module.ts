import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { IncomesRoutingModule } from './incomes-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { IncomeDetailsComponent } from './income-details/income-details.component';
import { MatDividerModule } from '@angular/material/divider';
import { AddIncomeModule } from './add-income/add-income.module';
import { BaseTableModule } from 'src/app/shared/base-table/base-table.module';



@NgModule({
  declarations: [
    IncomesComponent, IncomeDetailsComponent
  ],
  imports: [
    CommonModule,
    IncomesRoutingModule,
    MatIconModule,
    MatDialogModule,
    MatSidenavModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    AddIncomeModule,
    MatMenuModule,
    BaseTableModule
  ]
})
export class IncomesModule { }
