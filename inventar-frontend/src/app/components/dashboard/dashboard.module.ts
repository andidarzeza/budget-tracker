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
import { WeekPickerModule } from './week-picker/week-picker.module';
import { YearPickerModule } from './year-picker/year-picker.module';
import { AllTimeHeaderModule } from './all-time-header/all-time-header.module';
import { FlagPipeModule } from 'src/app/template/pipes/flag-pipe/flag-pipe.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatCardModule,
    DayPickerModule,
    WeekPickerModule,
    MonthPickerModule,
    YearPickerModule,
    AllTimeHeaderModule,
    MatIconModule,
    SpinnerModule,
    TableMessageModule,
    FlagPipeModule,
  ]
})
export class DashboardModule { }
