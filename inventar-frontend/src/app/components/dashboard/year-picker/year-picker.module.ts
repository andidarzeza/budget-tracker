import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearPickerComponent } from './year-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [YearPickerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    YearPickerComponent
  ]
})
export class YearPickerModule { }
