import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { TableActionInput } from './TableActionInput';

@Component({
  selector: 'app-table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.css']
})
export class TableActionsComponent {

  @Input() tableActionInput: TableActionInput;

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onOpenDialog: EventEmitter<any> = new EventEmitter();

  constructor(public sharedService: SharedService) { }

  refresh(): void {
    this.onRefresh.emit();
  }

  openDialog(): void {
    this.onOpenDialog.emit();
  }


}
