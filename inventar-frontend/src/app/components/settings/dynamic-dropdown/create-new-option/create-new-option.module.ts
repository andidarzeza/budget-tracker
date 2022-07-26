import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreateNewOptionComponent } from './create-new-option.component';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [CreateNewOptionComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [
    CreateNewOptionComponent
  ]
})
export class CreateNewOptionModule { }
