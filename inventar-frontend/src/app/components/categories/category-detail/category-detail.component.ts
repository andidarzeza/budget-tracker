import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, IconButtonComponent, ...TOOLTIP_IMPORTS],
})
export class CategoryDetailComponent implements OnInit {
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
      .subscribe((category: Category) => (this.category = category));
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
