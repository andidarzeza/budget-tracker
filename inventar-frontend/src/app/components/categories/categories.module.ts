import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IconSelectComponent } from '../../shared/icon-select/icon-select.component';
import { MatButtonModule } from '@angular/material/button';
import { CategoriesRoutingModule } from './categories-routing.module';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatTabsModule} from '@angular/material/tabs';
import { CategoriesTableComponent } from './categories-table/categories-table.component';
import { CategoryDetailModule } from './category-detail/category-detail.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AddCategoryModule } from './add-category/add-category.module';
import { FilterModule } from 'src/app/shared/table-actions/filter/filter.module';


@NgModule({
  declarations: [CategoriesComponent, CategoriesTableComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatSidenavModule,
    MatPaginatorModule,
    CategoryDetailModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    FilterModule,
    AddCategoryModule,
    SharedModule
  ]
})
export class CategoriesModule { }
