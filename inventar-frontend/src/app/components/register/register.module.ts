import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { RegisterRoutingModule } from './register-routing.module';
import { MatCardModule } from '@angular/material/card';
import { CapsLockModule } from 'src/app/directives/caps-lock/caps-lock.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';



@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    MatCardModule,
    CapsLockModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LabeledFormInputComponent
  ],
  exports: [RegisterComponent]
})
export class RegisterModule { }
