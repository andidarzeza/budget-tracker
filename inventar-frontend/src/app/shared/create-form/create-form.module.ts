import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateFormComponent } from './create-form.component';
import { CreateHeaderModule } from './create-header/create-header.module';
import { CreateFooterModule } from './create-footer/create-footer.module';



@NgModule({
  declarations: [CreateFormComponent],
  imports: [
    CommonModule,
    CreateHeaderModule,
    CreateFooterModule
  ],
  exports: [
    CreateFormComponent
  ]
})
export class CreateFormModule { }
