import { ChangeDetectionStrategy, Component, effect, ElementRef, EventEmitter, HostListener, Input, Output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FilterComponent } from '../base-table/table-actions/filter/filter.component';
import { FilterOptions } from '../base-table/table-actions/filter/filter.models';
import { IconButtonComponent } from '../icon-button/icon-button.component';

/**
 * Filters for the mobile ledger pages: a header button (with a count badge
 * while filters are active) that opens the shared filter form in an iOS
 * bottom sheet. Applying or resetting closes the sheet.
 */
@Component({
  selector: 'ledger-filters',
  templateUrl: './ledger-filters.component.html',
  styleUrls: ['./ledger-filters.component.css'],
  imports: [MatIconModule, FilterComponent, IconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedgerFiltersComponent {
  @Input() filterOptions: FilterOptions[] = [];

  @Output() search = new EventEmitter<{ params: any }>();
  @Output() reset = new EventEmitter<void>();

  readonly open = signal(false);
  readonly count = signal(0);
  /** Last applied values, so reopening the sheet shows the current filters. */
  readonly values = signal<Record<string, unknown>>({});

  /**
   * Page content lives under the floating tab bar's stacking layer, so the
   * open sheet is moved to <body> to sit above everything.
   */
  private readonly layer = viewChild<ElementRef<HTMLElement>>('layer');

  constructor() {
    effect(() => {
      const el = this.layer()?.nativeElement;
      if (el && el.parentElement !== document.body) document.body.appendChild(el);
    });
  }

  onApplied(payload: { params: any; count: number; values: Record<string, unknown> }): void {
    this.count.set(payload.count);
    this.values.set(payload.values);
    this.open.set(false);
    this.search.emit({ params: payload.params });
  }

  onReset(): void {
    this.count.set(0);
    this.values.set({});
    this.open.set(false);
    this.reset.emit();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.open.set(false);
  }
}
