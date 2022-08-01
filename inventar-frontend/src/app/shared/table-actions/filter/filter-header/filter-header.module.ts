import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterHeaderComponent } from './filter-header.component';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [FilterHeaderComponent],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [FilterHeaderComponent]
})
export class FilterHeaderModule { }
