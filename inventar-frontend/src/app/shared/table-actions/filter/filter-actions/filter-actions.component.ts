import { Component, EventEmitter, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'filter-actions',
  templateUrl: './filter-actions.component.html',
  styleUrls: ['./filter-actions.component.css']
})
export class FilterActionsComponent {

  @Output() public onReset = new EventEmitter(); 
  @Output() public onSearch = new EventEmitter();

  constructor(
    public sharedService: SharedService
  ) { }

  reset(): void {
    this.onReset.emit();
  }

  search(): void {
    this.onSearch.emit();
  }

}
