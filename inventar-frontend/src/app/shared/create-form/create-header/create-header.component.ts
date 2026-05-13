import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EntityType } from 'src/app/models/models';
import { IconButtonComponent } from '../../icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from '../../tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, IconButtonComponent, ...TOOLTIP_IMPORTS],
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
