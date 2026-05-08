import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { inOutAnimation } from '../animations';

@Component({
  selector: 'delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css'],
  animations: [inOutAnimation],
  imports: [MatButtonModule, MatIconModule],
})
export class DeleteConfirmationComponent {
  @Input() selectedItem: string;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<string>();

  delete(): void {
    this.onDelete.emit(this.selectedItem);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
