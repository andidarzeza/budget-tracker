import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableActionsComponent } from './table-actions.component';
import { FilterModule } from './filter/filter.module';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [TableActionsComponent],
  imports: [
    CommonModule,
    FilterModule,
    MatIconModule
  ],
  exports: [TableActionsComponent]
})
export class TableActionsModule { }
