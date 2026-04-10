import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { filterAnimation } from './filter/filter.animations';
import { FilterOptions } from './filter/filter.models';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css'],
  animations: [
    filterAnimation
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onOpenDialog: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onReset: EventEmitter<any> = new EventEmitter();
  showSearchInput: boolean = false;

  public containerId = "actions-container-id";
  public searchIconId = "search-icon-id";

  constructor() { }

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

  search(payload: any): void {
    this.onSearch.emit(payload);
    this.showSearchInput = false;
  }


  @HostListener('window:click', ['$event'])
  keyEvent(event: any): void {
    const elem = document.getElementById(this.containerId);
    const option = document.getElementsByTagName("mat-option");
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
    const t = document.getElementsByClassName("cdk-overlay-transparent-backdrop");
    if (t.length > 0) {
      close = false;
    }

    if (!elem?.contains(event.target) && event.target.id !== this.searchIconId && close) {
      this.showSearchInput = false;
    }

  }
}
