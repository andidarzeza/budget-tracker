import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FilterOptions } from './filter/filter.models';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css'],
  animations: [
    trigger(
      'inAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('200ms ease-out',
              style({ opacity: 1 }))
          ]
        )
      ]
    )
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
  public filterId = "filter-id";

  public containerId = "actions-container-id";
  public searchIconId = "search-icon-id";

  constructor(
    public sharedService: SharedService
  ) { }

  refresh(): void {
    this.onRefresh.emit();
  }

  openDialog(): void {
    this.onOpenDialog.emit();
  }

  openSearchInput(): void {
    const elem = document.getElementById(this.filterId);
    if(elem) {
      elem.style.display = "block";
    }
    this.showSearchInput = true;
  }

  reset(): void {
    this.onReset.emit();
    this.showSearchInput = false;
    const elem = document.getElementById(this.filterId);
    if(elem) {
      elem.style.display = "none";
    }
  }

  search(payload: any): void {
    this.onSearch.emit(payload);
    this.showSearchInput = false;
    const elem = document.getElementById(this.filterId);
    if(elem) {
      elem.style.display = "none";
    }
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
      const elem = document.getElementById(this.filterId);
      if(elem) {
        elem.style.display = "none";
      }
    }

  }
}
