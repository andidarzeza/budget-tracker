import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewOptionComponent } from './new-option.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [NewOptionComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    NewOptionComponent
  ]
})
export class NewOptionModule { }
