import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent } from './base-table.component';
import { SharedModule } from '../shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { TableHeaderModule } from './table-header/table-header.module';
import { TableBodyModule } from './table-body/table-body.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [BaseTableComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    MatSortModule,
    TableHeaderModule,
    MatIconModule,
    TableBodyModule,
    MatButtonModule
  ],
  exports: [
    BaseTableComponent
  ]
})
export class BaseTableModule { }
