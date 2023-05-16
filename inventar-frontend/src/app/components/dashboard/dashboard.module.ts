import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MonthPickerModule } from './month-picker/month-picker.module';
import { MatIconModule } from '@angular/material/icon';
import { SpinnerModule } from 'src/app/template/shared/spinner/spinner.module';
import { TableMessageModule } from 'src/app/shared/table-message/table-message.module';
import { DayPickerModule } from './day-picker/day-picker.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatCardModule,
    MonthPickerModule,
    DayPickerModule,
    MatIconModule,
    SpinnerModule,
    TableMessageModule
  ]
})
export class DashboardModule { }
