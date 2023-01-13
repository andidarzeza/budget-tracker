import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})
export class CategoryDetailComponent extends Unsubscribe implements OnInit {

  @Input() categoryId: string;
  private category: Category;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter();

  constructor(
    private categoriesService: CategoriesService,
    public sharedService: SharedService
  ) {
    super();
  }

  ngOnInit(): void {
    this.categoriesService
      .findOne(this.categoryId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((category: Category) => this.category = category);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  get name() {
    return this.category?.category ?? "-";
  }

  get createdTime() {
    return this.category?.lastModifiedDate;
  }

  get lastModifiedDate() {
    return this.category?.lastModifiedDate;
  }

  get description() {
    return this.category?.description ?? "no-notes-recorded"
  }

  get categoryIcon() {
    return this.category?.icon;
  }

}
