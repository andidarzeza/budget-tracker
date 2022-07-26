import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommunicationService } from './services/communication.service';


@Component({
  selector: 'dynamic-dropdown',
  templateUrl: './dynamic-dropdown.component.html',
  styleUrls: ['./dynamic-dropdown.component.css']
})
export class DynamicDropdownComponent {
  
  @Input() data: string[];
  @Input() inputLabel: string = "Lanes";
  @Input() appearance: string = "outline";
  @Output() onCreate = new EventEmitter<string>();

  public selectedItems: string[] = [];
  public allSelected = false;

  matSelectFormControl: FormControl = new FormControl();

  constructor(
    private communicationService: CommunicationService
  ) { }

  selectAll(): void {
    this.allSelected = !this.allSelected;
    this.selectedItems = this.allSelected ? this.data.slice() : [];    
    this.matSelectFormControl.setValue(this.selectedItems);
  }

  onSelect(item: string): void {
    const index = this.selectedItems.indexOf(item);
    index >  -1 ? this.selectedItems.splice(index, 1) : this.selectedItems.push(item);
    this.allSelected = this.selectedItems.length === this.data.length;
  }

  edit(item: string): void {
    this.communicationService.edit(item);
  }

  onCreateFunction(item: string): void {
    this.onCreate.emit(item);
  }

  getSelectTrigger(): string {
    if(this.selectedItems.length == 1) {
      return this.selectedItems[0];
    }
    return `${this.selectedItems[0]}  (+${this.selectedItems.length - 1} more)`;
  }

}
