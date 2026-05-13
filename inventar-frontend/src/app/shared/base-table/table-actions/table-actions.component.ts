import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconButtonComponent } from '../../icon-button/icon-button.component';
import { FilterComponent } from './filter/filter.component';
import { FilterOptions } from './filter/filter.models';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, IconButtonComponent, FilterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableActionsComponent {
  @HostBinding('class.table-actions--filter-open')
  get filterPanelOpen(): boolean {
    return this.filterOpen();
  }

  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];
  /** Hide icon + page title (e.g. when the page shows a dedicated title above the toolbar). */
  @Input() hideEmbeddedTitle = false;
  /** No primary-coloured bar; actions sit on the page background (mobile list pages). */
  @Input() mobileToolbar = false;

  @Output() onRefresh = new EventEmitter<void>();
  @Output() onOpenDialog = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<{ params: any }>();
  @Output() onReset = new EventEmitter<void>();

  /** Whether the filter panel is expanded under the toolbar. */
  readonly filterOpen = signal(false);
  /** How many filter fields are currently feeding the table query. */
  readonly appliedFilterCount = signal(0);
  /**
   * Last-applied form values, kept across panel close/open cycles so the
   * panel re-renders with the same selections instead of an empty form.
   * The filter component is destroyed when the user closes the panel
   * (`@if (filterOpen())`), so its internal state can't survive on its own.
   */
  readonly lastFilterValues = signal<Record<string, unknown>>({});

  refresh(): void {
    this.onRefresh.emit();
  }

  openDialog(): void {
    this.onOpenDialog.emit();
  }

  toggleFilter(): void {
    this.filterOpen.update((v) => !v);
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  onFilterApplied(payload: {
    params: any;
    count: number;
    values: Record<string, unknown>;
  }): void {
    this.appliedFilterCount.set(payload.count);
    this.lastFilterValues.set(payload.values);
    this.onSearch.emit({ params: payload.params });
  }

  onFilterReset(): void {
    this.appliedFilterCount.set(0);
    this.lastFilterValues.set({});
    this.onReset.emit();
  }
}
