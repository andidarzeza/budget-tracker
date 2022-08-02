import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableMessageComponent } from './table-message.component';



@NgModule({
  declarations: [TableMessageComponent],
  imports: [
    CommonModule
  ],
  exports: [TableMessageComponent]
})
export class TableMessageModule { }
