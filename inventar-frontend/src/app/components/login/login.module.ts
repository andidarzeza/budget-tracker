import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CapsLockModule } from 'src/app/directives/caps-lock/caps-lock.module';
import { SpinnerModule } from 'src/app/template/shared/spinner/spinner.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MatFormFieldModule,
    MatCardModule,
    CapsLockModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatInputModule,
    FormsModule,
    SpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ]
})
export class LoginModule { }
