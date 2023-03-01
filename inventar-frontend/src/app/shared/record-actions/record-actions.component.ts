import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'record-actions',
  templateUrl: './record-actions.component.html',
  styleUrls: ['./record-actions.component.css'],
  animations: [
    trigger(
      'slideAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('200ms ease', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('200ms ease', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class RecordActionsComponent {

  @Output() openEditForm: EventEmitter<any> = new EventEmitter();
  @Output() openDeleteDialog: EventEmitter<any> = new EventEmitter();
  @Output() openViewDrawer: EventEmitter<any> = new EventEmitter();

  @Input() displayEditAction = true;
  @Input() displayDeleteAction = true;

  showConfirmActions = false;
  
  constructor(public sharedService: SharedService) { }

  emitDeleteAction(event): void {
    event.stopPropagation();
    this.showConfirmActions = true;
  }

  confirmAction(event): void {
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
