import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableBodyComponent } from './table-body.component';
import { SharedModule } from '../../shared.module';



@NgModule({
  declarations: [TableBodyComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    TableBodyComponent
  ]
})
export class TableBodyModule { }
