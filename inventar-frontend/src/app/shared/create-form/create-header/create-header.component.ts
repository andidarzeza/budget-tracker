import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EntityType } from 'src/app/models/models';

@Component({
  selector: 'create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.css'],
  imports: [CommonModule],
})
export class CreateHeaderComponent {
  @Output() close = new EventEmitter<boolean>();
  @Output() create = new EventEmitter<void>();

  @Input() editMode: boolean;
  @Input() icon: string;
  @Input() entity: EntityType;
  /** Show the Add / Done button (hidden when a wizard supplies its own actions). */
  @Input() showConfirm = true;
  /** Overrides the default "Add" / "Done" label (e.g. "Move"). */
  @Input() confirmLabel?: string;

  closeDialog(refreshData: boolean): void {
    this.close.emit(refreshData);
  }
}
