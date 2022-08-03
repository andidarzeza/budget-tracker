import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityType } from 'src/app/models/models';

@Component({
  selector: 'create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent implements OnInit {

  @Input() icon: string;
  @Input() editMode: boolean;
  @Input() entity: EntityType;

  @Output() close = new EventEmitter();
  @Output() create = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  closeDialog(payload): void {
    this.close.emit(payload);
  }

  add(): void {
    this.create.emit();
  }

}
