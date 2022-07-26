import { Component, Input, OnInit } from '@angular/core';
import { DashboardDTO } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'expense-income-resume',
  templateUrl: './expense-income-resume.component.html',
  styleUrls: ['./expense-income-resume.component.css']
})
export class ExpenseIncomeResumeComponent implements OnInit {

  @Input() dashboardData: DashboardDTO;

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
  }

  public get expenses() {
    return this.dashboardData?.expenses ?? 0;
  }

  public get incomes() {
    return this.dashboardData?.incomes ?? 0;
  }

  public get increaseInExpense() {
    return this.dashboardData?.increaseInExpense ?? 0;
  }

  public get increaseInIncome() {
    return this.dashboardData?.increaseInIncome ?? 0;
  }

  public get averageDailyExpenses() {
    return this.dashboardData?.averageDailyExpenses ?? 0;
  }

  public get averageDailyIncome() {
    return this.dashboardData?.averageDailyIncome ?? 0;
  }

}
