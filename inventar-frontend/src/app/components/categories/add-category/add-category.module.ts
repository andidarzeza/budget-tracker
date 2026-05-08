import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCategoryComponent } from './add-category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { SelectIconModule } from 'src/app/shared/select-icon/select-icon.module';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { LabeledTextareaComponent } from 'src/app/shared/labeled-textarea/labeled-textarea.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';



@NgModule({
  declarations: [AddCategoryComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SelectIconModule,
    CreateFormModule,
    LabeledFormInputComponent,
    LabeledTextareaComponent,
    SelectInputComponent
  ]
})
export class AddCategoryModule { }
