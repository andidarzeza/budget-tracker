import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'filter-actions',
  templateUrl: './filter-actions.component.html',
  styleUrls: ['./filter-actions.component.css']
})
export class FilterActionsComponent {

  @Output() public onReset = new EventEmitter(); 
  @Output() public onSearch = new EventEmitter();

  constructor() { }

  reset(): void {
    this.onReset.emit();
  }

  search(): void {
    this.onSearch.emit();
  }

}
