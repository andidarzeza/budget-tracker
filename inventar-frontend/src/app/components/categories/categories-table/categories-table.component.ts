import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Sort } from '@angular/material/sort';
import { Category } from 'src/app/models/Category';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: ['./categories-table.component.css']
})
export class CategoriesTableComponent implements OnInit {
  @Input() public dataSource: Category[] = [];
  @Output() sortEvent: EventEmitter<Sort> = new EventEmitter();
  @Output() onOpenAddEditForm: EventEmitter<Category> = new EventEmitter();
  @Output() onOpenDeleteDialog: EventEmitter<string> = new EventEmitter();
  @Output() onViewCategoryDetails: EventEmitter<string> = new EventEmitter();
  public displayedColumns: string[] = ['icon', 'category', 'description', 'actions'];
  constructor(
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
  }

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
