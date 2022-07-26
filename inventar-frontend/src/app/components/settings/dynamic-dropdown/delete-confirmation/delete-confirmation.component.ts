import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { inOutAnimation } from '../animations';

@Component({
  selector: 'delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css'],
  animations: [inOutAnimation]
})
export class DeleteConfirmationComponent implements OnInit {

  @Input() selectedItem: string;
  @Output() onCancel = new EventEmitter();
  @Output() onDelete = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  delete(): void {
    this.onDelete.emit(this.selectedItem);
  }

  cancel(): void {
    this.onCancel.emit();
  }

}
