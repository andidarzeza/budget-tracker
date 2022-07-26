import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})
export class CategoryDetailComponent implements OnInit, OnDestroy {

  @Input() categoryId: string;
  private category: Category;
  private _subject = new Subject();
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter();

  constructor(
    private categoriesService: CategoriesService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.categoriesService
      .findOne(this.categoryId)
      .pipe(takeUntil(this._subject))
      .subscribe((category: Category) => this.category = category);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
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
