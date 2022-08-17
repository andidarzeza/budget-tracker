import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css']
})
export class TableHeaderComponent implements OnInit {

  constructor(
    public sharedService: SharedService
  ) { }

  @Input() displayedColumns: string[];

  ngOnInit(): void {
  }

}
