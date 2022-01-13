import { Component, EventEmitter, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-record-actions',
  templateUrl: './record-actions.component.html',
  styleUrls: ['./record-actions.component.css']
})
export class RecordActionsComponent {

  @Output() openEditForm: EventEmitter<any> = new EventEmitter();
  @Output() openDeleteDialog: EventEmitter<any> = new EventEmitter();

  constructor(public sharedService: SharedService) { }

  emitDeleteAction(): void {
    this.openDeleteDialog.emit();
  }

  emitEditAction(): void {
    this.openEditForm.emit();
  }

}
