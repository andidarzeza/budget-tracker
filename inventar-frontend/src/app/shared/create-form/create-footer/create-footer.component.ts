import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PillButtonComponent } from '../../pill-button/pill-button.component';

@Component({
  selector: 'create-footer',
  templateUrl: './create-footer.component.html',
  styleUrls: ['./create-footer.component.css'],
  imports: [PillButtonComponent],
})
export class CreateFooterComponent {
  @Input() editMode: boolean;
  @Output() create = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  add(): void {
    this.create.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
