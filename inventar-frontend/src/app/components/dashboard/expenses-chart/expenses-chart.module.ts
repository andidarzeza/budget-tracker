import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesChartComponent } from './expenses-chart.component';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [ExpensesChartComponent],
  imports: [
    CommonModule,
    MatCardModule
  ],
  exports: [
    ExpensesChartComponent
  ]
})
export class ExpensesChartModule { }
