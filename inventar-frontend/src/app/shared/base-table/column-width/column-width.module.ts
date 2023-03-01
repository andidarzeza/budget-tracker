import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnWidthPipe } from './column-width.pipe';



@NgModule({
  declarations: [ColumnWidthPipe],
  imports: [
    CommonModule
  ],
  exports: [
    ColumnWidthPipe
  ]
})
export class ColumnWidthModule { }
