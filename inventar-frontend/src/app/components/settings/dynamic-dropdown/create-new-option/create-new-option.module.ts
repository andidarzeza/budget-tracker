import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreateNewOptionComponent } from './create-new-option.component';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';



@NgModule({
  declarations: [CreateNewOptionComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    LabeledFormInputComponent
  ],
  exports: [
    CreateNewOptionComponent
  ]
})
export class CreateNewOptionModule { }
