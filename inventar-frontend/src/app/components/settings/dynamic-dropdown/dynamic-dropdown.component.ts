import { Component, Input } from '@angular/core';
import { CommunicationService } from './services/communication.service';


@Component({
  selector: 'dynamic-dropdown',
  templateUrl: './dynamic-dropdown.component.html',
  styleUrls: ['./dynamic-dropdown.component.css']
})
export class DynamicDropdownComponent {
  
  @Input() data: string[];
  @Input() inputLabel: string = "Lanes";
  @Input() appearance: string = "fill";

  public selectedItems: string[] = [];

  public allSelected = false;

  constructor(
    private communicationService: CommunicationService
  ) { }

  selectAll(): void {
    this.allSelected = !this.allSelected;
    this.selectedItems = this.allSelected ? this.data.slice() : [];
    this.communicationService.toggleSelectAll(this.allSelected);
  }

  onSelect(item: string): void {
    const index = this.selectedItems.indexOf(item);
    index >  -1 ? this.selectedItems.splice(index, 1) : this.selectedItems.push(item);
    this.allSelected = this.selectedItems.length === this.data.length;
  }

}
