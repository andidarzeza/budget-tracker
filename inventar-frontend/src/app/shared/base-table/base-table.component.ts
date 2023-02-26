import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { inOutSlide } from 'src/app/animations';
import { ColumnDefinition } from 'src/app/models/models';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { SharedService } from 'src/app/services/shared.service';
import { FilterOptions } from './table-actions/filter/filter.models';
import { TableActionInput } from './table-actions/TableActionInput';

@Component({
  selector: 'base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.css'],
  animations: [inOutSlide]
})
export class BaseTableComponent {

  @Input() data: any[];
  @Input() total: number;
  @Input() columnDefinition: ColumnDefinition[];
  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  
  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];
  @Input() tableId: string;
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onOpenDialog: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onReset: EventEmitter<any> = new EventEmitter();
  @Output() nextPage: EventEmitter<number> = new EventEmitter();
  displayDrawer = false;
  constructor(
    public sharedService: SharedService,
    public breakpointService: BreakpointService
  ) { }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.displayDrawer = true;
  }

  handlePageEvent(event: {pageIndex: number}): void {
    this.nextPage.emit(event.pageIndex)
  }
}
