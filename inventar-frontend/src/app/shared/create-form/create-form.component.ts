import { Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { EntityType } from 'src/app/models/models';

@Component({
  selector: 'create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css'],
  animations: [inOutAnimation]
})
export class CreateFormComponent {

  @Input() icon: string;
  @Input() editMode: boolean;
  @Input() entity: EntityType;
  @Input() loadingData: boolean;

  @Output() close = new EventEmitter();
  @Output() create = new EventEmitter();
  constructor() { }

  closeDialog(payload): void {
    this.close.emit(payload);
  }

  add(): void {
    this.create.emit();
  }

}
