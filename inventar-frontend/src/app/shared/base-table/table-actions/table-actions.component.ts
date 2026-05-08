import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterComponent } from './filter/filter.component';
import { filterAnimation } from './filter/filter.animations';
import { FilterOptions } from './filter/filter.models';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, FilterComponent],
  animations: [filterAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableActionsComponent {
  @HostBinding('class.table-actions--mobile-search-open')
  get mobileSearchPanelOpen(): boolean {
    return this.mobileToolbar && this.showSearchInput;
  }

  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];
  /** Hide icon + page title (e.g. when the page shows a dedicated title above the toolbar). */
  @Input() hideEmbeddedTitle = false;
  /** No primary-colored bar; actions sit on the page background (mobile list pages). */
  @Input() mobileToolbar = false;

  @Output() onRefresh = new EventEmitter<void>();
  @Output() onOpenDialog = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<{ params: any }>();
  @Output() onReset = new EventEmitter<void>();

  showSearchInput = false;

  readonly containerId = 'actions-container-id';
  readonly searchIconId = 'search-icon-id';

  refresh(): void {
    this.onRefresh.emit();
  }

  openDialog(): void {
    this.onOpenDialog.emit();
  }

  openSearchInput(): void {
    this.showSearchInput = true;
  }

  reset(): void {
    this.onReset.emit();
    this.showSearchInput = false;
  }

  search(payload: { params: any }): void {
    this.onSearch.emit(payload);
    this.showSearchInput = false;
  }

  @HostListener('window:click', ['$event'])
  keyEvent(event: any): void {
    const elem = document.getElementById(this.containerId);
    const option = document.getElementsByTagName('mat-option');
    let close = true;
    if (option.length !== 0) {
      for (let i = 0; i < option.length; i++) {
        const opt = option[i];
        if (opt?.contains(event.target)) {
          close = false;
          break;
        }
      }
    }
    const t = document.getElementsByClassName('cdk-overlay-transparent-backdrop');
    if (t.length > 0) {
      close = false;
    }

    if (!elem?.contains(event.target) && event.target.id !== this.searchIconId && close) {
      this.showSearchInput = false;
    }
  }
}
