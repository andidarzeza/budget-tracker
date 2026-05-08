import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { SharedService } from 'src/app/services/shared.service';
import { FilterActionsComponent } from './filter-actions/filter-actions.component';
import { FilterHeaderComponent } from './filter-header/filter-header.component';
import { FilterOptions } from './filter.models';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDividerModule,
    LabeledFormInputComponent,
    SelectInputComponent,
    FilterActionsComponent,
    FilterHeaderComponent,
  ],
})
export class FilterComponent implements OnInit {
  private readonly formBuilder = inject(UntypedFormBuilder);
  readonly sharedService = inject(SharedService);

  @Output() onReset = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<{ params: HttpParams }>();
  @Input() filterOptions: FilterOptions[];

  readonly formGroup: UntypedFormGroup = this.formBuilder.group({});

  ngOnInit(): void {
    this.filterOptions?.forEach((filterOption: FilterOptions) => {
      this.formGroup.addControl(filterOption.field, new UntypedFormControl());
    });
  }

  onEnter(): void {
    this.search();
  }

  reset(): void {
    this.formGroup.reset();
    this.onReset.emit();
  }

  search(): void {
    let params: HttpParams = new HttpParams();
    for (const [key, value] of Object.entries(this.formGroup.value)) {
      if (value) {
        params = params.append(key, value as string);
      }
    }
    this.onSearch.emit({ params });
  }

  /**
   * Bridge between the legacy filter-options config (`{ displayBy, valueBy }`)
   * and `cb-select-input`'s `displayWith` / `valueWith` callbacks.
   * Returns a function that reads `option[displayBy]` / `option[valueBy]`.
   */
  displayBy(filterOption: FilterOptions): (opt: any) => string {
    const key = filterOption?.matSelectOptions?.displayBy;
    return (opt: any) => (opt && key ? String(opt[key]) : '');
  }

  valueBy(filterOption: FilterOptions): (opt: any) => unknown {
    const key = filterOption?.matSelectOptions?.valueBy;
    return (opt: any) => (opt && key ? opt[key] : opt);
  }
}
