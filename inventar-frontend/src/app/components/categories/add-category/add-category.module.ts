import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCategoryComponent } from './add-category.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { SelectIconModule } from 'src/app/shared/select-icon/select-icon.module';
import { MatSelectModule } from '@angular/material/select';



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
    MatSelectModule
  ]
})
export class AddCategoryModule { }
