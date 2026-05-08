import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EntityType } from 'src/app/models/models';

@Component({
  selector: 'create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class CreateHeaderComponent {
  @Output() close = new EventEmitter<boolean>();

  @Input() editMode: boolean;
  @Input() icon: string;
  @Input() entity: EntityType;

  closeDialog(refreshData: boolean): void {
    this.close.emit(refreshData);
  }
}
