import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'record-actions',
  templateUrl: './record-actions.component.html',
  styleUrls: ['./record-actions.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, IconButtonComponent],
})
export class RecordActionsComponent {
  @Output() openEditForm = new EventEmitter<void>();
  @Output() openDeleteDialog = new EventEmitter<void>();
  @Output() openViewDrawer = new EventEmitter<void>();

  @Input() displayEditAction = true;
  @Input() displayDeleteAction = true;
  @Input() displayViewAction = true;

  emitDeleteAction(event: Event): void {
    event.stopPropagation();
    this.openDeleteDialog.emit();
  }

  emitEditAction(event: Event): void {
    event.stopPropagation();
    this.openEditForm.emit();
  }

  emitViewAction(event: Event): void {
    event.stopPropagation();
    this.openViewDrawer.emit();
  }
}
