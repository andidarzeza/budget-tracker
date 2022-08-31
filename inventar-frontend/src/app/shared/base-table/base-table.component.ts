import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';
import { FilterOptions } from './table-actions/filter/filter.models';
import { TableActionInput } from './table-actions/TableActionInput';

@Component({
  selector: 'base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.css']
})
export class BaseTableComponent implements OnChanges{

  @Input() data: any[];
  @Input() columnDefinition: ColumnDefinition[];
  displayedColumns: string[];

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  @Output() onScroll = new EventEmitter();

  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onOpenDialog: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onReset: EventEmitter<any> = new EventEmitter();
  
  constructor(
    public sharedService: SharedService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.columnDefinition) {
      this.displayedColumns = this.columnDefinition.map(columnDefinition => columnDefinition.column);
    }
  }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.onViewDetails.emit(id);
  }


}
