import { Component, Input, OnInit } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css']
})
export class TableHeaderComponent {

  constructor(
    public sharedService: SharedService
  ) { }

  @Input() displayDrawer: boolean;
  @Input() columnDefinitions: ColumnDefinition[];

  getRequestedWidth(columns: number, type: any): any {
    if(this.displayDrawer) {
      if(type == 'Actions') {
        return 0;
      } else {
        return 60/(columns-1);
      }
    }
    return 100 / columns;
  }

}
