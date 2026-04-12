import { Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { EntityType } from 'src/app/models/models';

@Component({ standalone: false,
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
  /** Optional text under the spinner (defaults in form-spinner if omitted). */
  @Input() loadingMessage: string;
  /** When true, the default Cancel / Save footer is hidden so the projected content can supply its own actions. */
  @Input() hideDefaultFooter = false;

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
