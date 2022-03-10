import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CapsLockDirective } from 'src/app/directives/caps-lock.directive';
import { MatIconModule } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';


@NgModule({
  declarations: [LoginComponent,  CapsLockDirective],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ]
})
export class LoginModule { }
