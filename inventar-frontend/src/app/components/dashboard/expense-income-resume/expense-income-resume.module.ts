import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseIncomeResumeComponent } from './expense-income-resume.component';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [ExpenseIncomeResumeComponent],
  imports: [
    CommonModule,
    MatCardModule,
    SharedModule
  ],
  exports: [ExpenseIncomeResumeComponent]
})
export class ExpenseIncomeResumeModule { }
