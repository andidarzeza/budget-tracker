import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { ColumnDefinition } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';
import { ScrollLoader } from 'src/app/template/shared/scroll-loader';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css'],
  animations: [inOutAnimation]
})
export class TableBodyComponent implements AfterViewInit {

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];
  @Input() tableId: string;
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  @Input() displayDrawer: boolean;

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  @Output() onScroll = new EventEmitter();
  @Output() onTopScroll = new EventEmitter();
  selectedId: string;

  constructor(
    public sharedService: SharedService
  ) { }

  ngAfterViewInit(): void {
    const element = document.getElementById(this.tableId);
    if (element) {
      const scrollLoader = new ScrollLoader(element);
      const listenable = scrollLoader.listenForScrollChange();
      listenable.onScroll(() => this.onScroll.emit());
      listenable.onTopScroll(() => this.onTopScroll.emit());
    }
  }

  getRequestedWidth(columns: number, type: any): any {
    if(this.displayDrawer) {
      if(type == 'actions') {
        return 0;
      } else {
        return 60/(columns-1);
      }
    }
    return 100 / columns;
  }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.selectedId = id;
    this.onViewDetails.emit(id);
  }

}
