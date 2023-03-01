import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'record-actions',
  templateUrl: './record-actions.component.html',
  styleUrls: ['./record-actions.component.css']
})
export class RecordActionsComponent {

  @Output() openEditForm: EventEmitter<any> = new EventEmitter();
  @Output() openDeleteDialog: EventEmitter<any> = new EventEmitter();
  @Output() openViewDrawer: EventEmitter<any> = new EventEmitter();

  @Input() displayEditAction = true;
  @Input() displayDeleteAction = true;
  
  constructor() { }

  emitDeleteAction(event): void {
    event.stopPropagation();
    this.openDeleteDialog.emit();
  }

  emitEditAction(event): void {    
    event.stopPropagation();
    this.openEditForm.emit();
  }

  emitViewAction(event): void {
    event.stopPropagation();
    this.openViewDrawer.emit();
  }

}
