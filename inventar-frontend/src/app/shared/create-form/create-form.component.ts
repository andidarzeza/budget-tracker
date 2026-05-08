import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { EntityType } from 'src/app/models/models';
import { CreateFooterComponent } from './create-footer/create-footer.component';
import { CreateHeaderComponent } from './create-header/create-header.component';
import { FormSpinnerComponent } from './form-spinner/form-spinner.component';

@Component({
  selector: 'create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css'],
  imports: [CommonModule, CreateHeaderComponent, CreateFooterComponent, FormSpinnerComponent],
  animations: [inOutAnimation],
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

  @Output() close = new EventEmitter<boolean>();
  @Output() create = new EventEmitter<void>();

  closeDialog(payload: boolean): void {
    this.close.emit(payload);
  }

  add(): void {
    this.create.emit();
  }
}
