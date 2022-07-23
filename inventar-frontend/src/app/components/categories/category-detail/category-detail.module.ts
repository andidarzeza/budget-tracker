import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryDetailComponent } from './category-detail.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [CategoryDetailComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [CategoryDetailComponent]
})
export class CategoryDetailModule { }
