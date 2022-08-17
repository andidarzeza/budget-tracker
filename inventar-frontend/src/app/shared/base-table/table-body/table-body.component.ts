import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';
import { ScrollLoader } from 'src/app/template/shared/scroll-loader';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css']
})
export class TableBodyComponent implements AfterViewInit {

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  @Output() onScroll = new EventEmitter();


  tableId = uuidv4();
  constructor(
    public sharedService: SharedService
  ) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const element = document.getElementById(this.tableId);
      if (element) {
        const scrollLoader = new ScrollLoader(element);
        scrollLoader.listenForScrollChange(element).onScroll(() => {          
          this.onScroll.emit();
        });
      }
    }, 100);
  }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.onViewDetails.emit(id);
  }

}
