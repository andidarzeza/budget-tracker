import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomOptionComponent } from './custom-option.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [CustomOptionComponent],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  exports: [CustomOptionComponent]
})
export class CustomOptionModule { }
