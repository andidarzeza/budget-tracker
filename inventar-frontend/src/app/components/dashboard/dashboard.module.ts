import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MonthPickerModule } from './month-picker/month-picker.module';
import { MatIconModule } from '@angular/material/icon';
import { SpinnerModule } from 'src/app/template/shared/spinner/spinner.module';
import { TableMessageModule } from 'src/app/shared/table-message/table-message.module';
import { DayPickerModule } from './day-picker/day-picker.module';
import { WeekPickerModule } from './week-picker/week-picker.module';
import { YearPickerModule } from './year-picker/year-picker.module';
import { AllTimeHeaderModule } from './all-time-header/all-time-header.module';
import { FlagPipeModule } from 'src/app/template/pipes/flag-pipe/flag-pipe.module';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { EditBalanceComponent } from './edit-balance/edit-balance.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EditBalanceComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CreateFormModule,
    DayPickerModule,
    WeekPickerModule,
    MonthPickerModule,
    YearPickerModule,
    AllTimeHeaderModule,
    MatIconModule,
    SpinnerModule,
    TableMessageModule,
    FlagPipeModule,
    LabeledFormInputComponent,
  ]
})
export class DashboardModule { }
