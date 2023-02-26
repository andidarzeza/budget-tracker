import { Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { ColumnDefinition } from 'src/app/models/models';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css'],
  animations: [inOutAnimation]
})
export class TableBodyComponent {

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];
  @Input() tableId: string;
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  @Input() displayDrawer: boolean;

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  @Output() onScroll = new EventEmitter();
  @Output() onTopScroll = new EventEmitter();
  selectedId: string;

  constructor() { }

  getRequestedWidth(columns: number, type: any): any {
    if(this.displayDrawer) {
      if(type == 'actions') {
        return 0;
      } else {
        return 60/(columns-1);
      }
    }
    return 100 / columns;
  }

  idTrackFn = (element: any) => element.id;

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.selectedId = id;
    this.onViewDetails.emit(id);
  }

}
