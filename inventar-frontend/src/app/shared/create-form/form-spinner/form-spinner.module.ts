import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormSpinnerComponent } from './form-spinner.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  declarations: [FormSpinnerComponent],
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  exports: [FormSpinnerComponent]
})
export class FormSpinnerModule { }
