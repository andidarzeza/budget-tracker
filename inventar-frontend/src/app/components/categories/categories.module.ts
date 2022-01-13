import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { AddCategoryComponent } from './add-category/add-category.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IconSelectComponent } from '../../shared/icon-select/icon-select.component';
import { MatButtonModule } from '@angular/material/button';
import { CategoriesRoutingModule } from './categories-routing.module';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [CategoriesComponent, AddCategoryComponent, IconSelectComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatMenuModule
  ]
})
export class CategoriesModule { }
