import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { ExpensesChartModule } from './expenses-chart/expenses-chart.module';
import { ExpenseIncomeResumeModule } from './expense-income-resume/expense-income-resume.module';
import { BudgetInfoModule } from './budget-info/budget-info.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MonthPickerModule } from './month-picker/month-picker.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ExpenseCategoriesModule,
    BudgetInfoModule,
    ExpenseIncomeResumeModule,
    ExpensesChartModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MonthPickerModule
  ]
})
export class DashboardModule { }
