import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseDetailComponent } from './expense-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [ExpenseDetailComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [
    ExpenseDetailComponent
  ]
})
export class ExpenseDetailModule { }
