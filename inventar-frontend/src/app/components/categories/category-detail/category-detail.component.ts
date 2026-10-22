import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Category } from 'src/app/models/models';
import { CategoriesService } from 'src/app/services/pages/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css'],
  imports: [CommonModule,  MatDividerModule, MatIconModule, IconButtonComponent, ...TOOLTIP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent implements OnInit {
  /** OnPush + zoneless: re-render once the record has loaded. */
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly categoriesService = inject(CategoriesService);
  readonly sharedService = inject(SharedService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() categoryId: string;
  @Output() onCloseAction = new EventEmitter<void>();

  private category: Category;

  ngOnInit(): void {
    this.categoriesService
      .findOne(this.categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((category: Category) => {
        this.category = category;
        this.cdr.markForCheck();
      });
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  get name() {
    return this.category?.category ?? '-';
  }

  get createdTime() {
    return this.category?.lastModifiedDate;
  }

  get lastModifiedDate() {
    return this.category?.lastModifiedDate;
  }

  get description() {
    return this.category?.description ?? 'no-notes-recorded';
  }

  get categoryIcon() {
    return this.category?.icon;
  }
}
