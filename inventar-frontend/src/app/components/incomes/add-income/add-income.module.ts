import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { AddIncomeComponent } from './add-income.component';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { FlagPipeModule } from 'src/app/template/pipes/flag-pipe/flag-pipe.module';



@NgModule({
  declarations: [
    AddIncomeComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    CreateFormModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatMenuModule,
    FlagPipeModule
  ]
})
export class AddIncomeModule { }
