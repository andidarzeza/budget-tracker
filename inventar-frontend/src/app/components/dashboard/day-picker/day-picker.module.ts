import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayPickerComponent } from './day-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [DayPickerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    DayPickerComponent
  ]
})
export class DayPickerModule { }
