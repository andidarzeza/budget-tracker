import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableBodyComponent } from './table-body.component';
import { SharedModule } from '../../shared.module';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';



@NgModule({
  declarations: [TableBodyComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatRippleModule,
    MatMenuModule,
    ScrollingModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    TableBodyComponent
  ]
})
export class TableBodyModule { }
