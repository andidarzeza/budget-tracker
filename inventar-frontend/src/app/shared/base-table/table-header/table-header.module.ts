import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableHeaderComponent } from './table-header.component';
import { ColumnWidthModule } from '../column-width/column-width.module';



@NgModule({
  declarations: [TableHeaderComponent],
  imports: [
    CommonModule,
    ColumnWidthModule
  ],
  exports: [
    TableHeaderComponent
  ]
})
export class TableHeaderModule { }
