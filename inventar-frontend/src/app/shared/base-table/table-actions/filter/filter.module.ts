import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { FilterActionsModule } from './filter-actions/filter-actions.module';
import { MatIconModule } from '@angular/material/icon';
import { FilterHeaderModule } from './filter-header/filter-header.module';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [FilterComponent],
  imports: [
    CommonModule,
    FilterActionsModule,
    MatIconModule,
    FilterHeaderModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [FilterComponent]
})
export class FilterModule { }
