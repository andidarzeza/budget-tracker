import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormSpinnerComponent } from './form-spinner.component';

@NgModule({
  declarations: [FormSpinnerComponent],
  imports: [
    CommonModule
  ],
  exports: [FormSpinnerComponent]
})
export class FormSpinnerModule { }
