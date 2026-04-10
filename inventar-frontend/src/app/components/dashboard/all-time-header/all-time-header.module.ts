import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllTimeHeaderComponent } from './all-time-header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [AllTimeHeaderComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    AllTimeHeaderComponent
  ]
})
export class AllTimeHeaderModule { }
