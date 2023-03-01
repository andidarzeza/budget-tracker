import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableActionsComponent } from './table-actions.component';
import { FilterModule } from './filter/filter.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [TableActionsComponent],
  imports: [
    CommonModule,
    FilterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [TableActionsComponent]
})
export class TableActionsModule { }
