import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { ColumnDefinition } from 'src/app/models/models';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBodyComponent {

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  @Input() displayDrawer: boolean;

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  selectedId: string;

  constructor() { }

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
