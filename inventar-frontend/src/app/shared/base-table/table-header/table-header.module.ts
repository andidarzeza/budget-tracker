import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableHeaderComponent } from './table-header.component';



@NgModule({
  declarations: [TableHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [
    TableHeaderComponent
  ]
})
export class TableHeaderModule { }
