import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableBodyComponent } from './table-body.component';
import { SharedModule } from '../../shared.module';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [TableBodyComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatRippleModule,
    MatMenuModule,
    ScrollingModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [
    TableBodyComponent
  ]
})
export class TableBodyModule { }
