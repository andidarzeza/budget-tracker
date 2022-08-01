import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterActionsComponent } from './filter-actions.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [FilterActionsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    FilterActionsComponent
  ]
})
export class FilterActionsModule { }
