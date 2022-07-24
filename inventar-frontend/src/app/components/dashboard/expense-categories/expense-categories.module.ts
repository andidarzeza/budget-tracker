import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseCategoriesComponent } from './expense-categories.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [ExpenseCategoriesComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    SharedModule
  ],
  exports: [
    ExpenseCategoriesComponent
  ]
})
export class ExpenseCategoriesModule { }
