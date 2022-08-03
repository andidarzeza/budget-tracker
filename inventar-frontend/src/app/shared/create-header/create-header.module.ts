import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateHeaderComponent } from './create-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [CreateHeaderComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [CreateHeaderComponent]
})
export class CreateHeaderModule { }
