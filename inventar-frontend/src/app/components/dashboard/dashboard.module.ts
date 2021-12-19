import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetInfoComponent } from './budget-info/budget-info.component';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    DashboardComponent, BudgetInfoComponent, DatePickerComponent
  ],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class DashboardModule { }
