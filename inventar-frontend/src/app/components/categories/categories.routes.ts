import { Routes } from '@angular/router';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoriesComponent } from './categories.component';

export const CATEGORIES_ROUTES: Routes = [
  { path: '', component: CategoriesComponent },
  { path: 'add', component: AddCategoryComponent },
  // Mobile edit is a page too, so swiping back lands on the list.
  { path: ':id/edit', component: AddCategoryComponent },
];
