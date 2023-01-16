import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseIncomeResumeComponent } from './expense-income-resume.component';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [ExpenseIncomeResumeComponent],
  imports: [
    CommonModule,
    MatCardModule,
    SharedModule,
    MatIconModule
  ],
  exports: [ExpenseIncomeResumeComponent]
})
export class ExpenseIncomeResumeModule { }
