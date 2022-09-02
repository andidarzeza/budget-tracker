import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToggleModule } from '../toggle/toggle.module';



@NgModule({
  declarations: [DropdownComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ToggleModule
  ],
  exports: [
    DropdownComponent
  ]
})
export class DropdownModule { }
