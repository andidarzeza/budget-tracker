import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeDetailsComponent } from './income-details.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    IncomeDetailsComponent
  ],
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    IncomeDetailsComponent
  ]
})
export class IncomeDetailsModule { }
