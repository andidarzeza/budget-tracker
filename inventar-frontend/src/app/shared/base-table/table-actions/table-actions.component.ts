import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { filterAnimation } from './filter/filter.animations';
import { FilterOptions } from './filter/filter.models';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css'],
  animations: [
    filterAnimation
  ]
})
export class TableActionsComponent {

  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];

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
