import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-record-actions',
  templateUrl: './record-actions.component.html',
  styleUrls: ['./record-actions.component.css']
})
export class RecordActionsComponent {

  @Output() openEditForm: EventEmitter<any> = new EventEmitter();
  @Output() openDeleteDialog: EventEmitter<any> = new EventEmitter();
  @Output() openViewDrawer: EventEmitter<any> = new EventEmitter();

  @Input() displayEditAction = true;
  @Input() displayDeleteAction = true;
  
  constructor(public sharedService: SharedService) { }

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
