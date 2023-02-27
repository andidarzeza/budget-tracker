import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableMessageComponent } from './table-message.component';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [TableMessageComponent],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [TableMessageComponent]
})
export class TableMessageModule { }
