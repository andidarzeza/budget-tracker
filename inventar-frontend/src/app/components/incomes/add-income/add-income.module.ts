import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AddIncomeComponent } from './add-income.component';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';



@NgModule({
  declarations: [
    AddIncomeComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    CreateFormModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class AddIncomeModule { }
