import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Category } from 'src/app/models/models';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: ['./categories-table.component.css']
})
export class CategoriesTableComponent {
  
  @Input() public dataSource: Category[] = [];
  @Output() sortEvent: EventEmitter<Sort> = new EventEmitter();
  @Output() onOpenAddEditForm: EventEmitter<Category> = new EventEmitter();
  @Output() onOpenDeleteDialog: EventEmitter<string> = new EventEmitter();
  @Output() onViewCategoryDetails: EventEmitter<string> = new EventEmitter();
  public displayedColumns: string[] = ['icon', 'category', 'description', 'actions'];

  constructor(
    public sharedService: SharedService
  ) {}

  announceSortChange(sort: Sort): void {
    this.sortEvent.emit(sort);
  }

  openAddEditForm(category: Category): void {
    this.onOpenAddEditForm.emit(category);
  }

  openDeleteConfirmDialog(id: string): void {
    this.onOpenDeleteDialog.emit(id);
  }

  viewCategoryDetails(id: string): void {
    this.onViewCategoryDetails.emit(id);
  }

}
