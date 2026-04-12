import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateFormComponent } from './create-form.component';
import { CreateHeaderModule } from './create-header/create-header.module';
import { CreateFooterModule } from './create-footer/create-footer.module';
import { FormSpinnerModule } from './form-spinner/form-spinner.module';
import { AmountKeypadComponent } from '../amount-keypad/amount-keypad.component';

@NgModule({
  declarations: [CreateFormComponent, AmountKeypadComponent],
  imports: [
    CommonModule,
    CreateHeaderModule,
    CreateFooterModule,
    FormSpinnerModule
  ],
  exports: [
    CreateFormComponent,
    AmountKeypadComponent,
  ]
})
export class CreateFormModule { }
