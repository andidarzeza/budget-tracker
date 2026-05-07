import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { FilterActionsModule } from './filter-actions/filter-actions.module';
import { MatIconModule } from '@angular/material/icon';
import { FilterHeaderModule } from './filter-header/filter-header.module';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';



@NgModule({
  declarations: [FilterComponent],
  imports: [
    CommonModule,
    FilterActionsModule,
    MatIconModule,
    FilterHeaderModule,
    MatDividerModule,
    ReactiveFormsModule,
    LabeledFormInputComponent,
    SelectInputComponent
  ],
  exports: [FilterComponent]
})
export class FilterModule { }
