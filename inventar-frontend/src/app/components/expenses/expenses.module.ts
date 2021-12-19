import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';



@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatButtonModule,
    MatNativeDateModule
  ]
})
export class ExpensesModule { }
