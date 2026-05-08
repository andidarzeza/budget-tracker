import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { CreateNewOptionComponent } from './create-new-option/create-new-option.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { CommunicationService } from './services/communication.service';

@Component({
  selector: 'dynamic-dropdown',
  templateUrl: './dynamic-dropdown.component.html',
  styleUrls: ['./dynamic-dropdown.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule,
    CreateNewOptionComponent,
    DeleteConfirmationComponent,
  ],
})
export class DynamicDropdownComponent {
  private readonly communicationService = inject(CommunicationService);

  @Input() data: string[];
  @Input() inputLabel: string = 'Lanes';
  @Input() appearance: string = 'outline';
  @Output() onCreate = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onSelection = new EventEmitter<string[]>();

  selectedItemToDelete: string;
  selectedItems: string[] = [];
  allSelected = false;

  matSelectFormControl = new FormControl();
  showDeleteModal = false;

  selectAll(): void {
    this.allSelected = !this.allSelected;
    this.selectedItems = this.allSelected ? this.data.slice() : [];
    this.matSelectFormControl.setValue(this.selectedItems);
    this.onSelection.emit(this.selectedItems);
  }

  onSelect(item: string): void {
    const index = this.selectedItems.indexOf(item);
    index > -1 ? this.selectedItems.splice(index, 1) : this.selectedItems.push(item);
    this.allSelected = this.selectedItems.length === this.data.length;
    this.onSelection.emit(this.selectedItems);
  }

  edit(item: string): void {
    this.communicationService.edit(item);
  }

  openDeleteDialog(item: string): void {
    this.selectedItemToDelete = item;
    this.showDeleteModal = true;
  }

  delete(item: string): void {
    this.showDeleteModal = false;
    this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    this.onDelete.emit(item);
  }

  cancelDeleteOperation(): void {
    this.showDeleteModal = false;
  }

  onCreateFunction(item: string): void {
    this.onCreate.emit(item);
  }

  getSelectTrigger(): string {
    if (this.selectedItems.length == 1) {
      return this.selectedItems[0];
    }
    return `${this.selectedItems[0]}  (+${this.selectedItems.length - 1} more)`;
  }
}
