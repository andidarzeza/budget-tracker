import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddExpenseComponent } from './add-expense.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { FlagPipeModule } from 'src/app/template/pipes/flag-pipe/flag-pipe.module';



@NgModule({
  declarations: [AddExpenseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    CreateFormModule,
    FlagPipeModule
  ]
})
export class AddExpenseModule { }
