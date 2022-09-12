import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes.component';
import { IncomesRoutingModule } from './incomes-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AddIncomeModule } from './add-income/add-income.module';
import { BaseTableModule } from 'src/app/shared/base-table/base-table.module';
import { IncomeDetailsModule } from './income-details/income-details.module';



@NgModule({
  declarations: [
    IncomesComponent
  ],
  imports: [
    CommonModule,
    IncomesRoutingModule,
    MatSidenavModule,
    SharedModule,
    AddIncomeModule,
    IncomeDetailsModule,
    BaseTableModule
  ]
})
export class IncomesModule { }
