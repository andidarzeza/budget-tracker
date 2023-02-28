import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityType } from 'src/app/models/models';

@Component({
  selector: 'create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.css']
})
export class CreateHeaderComponent implements OnInit {
  @Output() close = new EventEmitter();

  constructor() { }

  @Input() public editMode: boolean;
  @Input() public icon: string;
  @Input() public entity: EntityType;
  
  ngOnInit(): void {
  }

  closeDialog(refreshData: boolean): void {
    this.close.emit(refreshData);
  }

}
