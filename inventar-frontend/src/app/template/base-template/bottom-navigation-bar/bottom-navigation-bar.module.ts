import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigationBarComponent } from './bottom-navigation-bar.component';



@NgModule({
  declarations: [BottomNavigationBarComponent],
  imports: [
    CommonModule
  ],
  exports: [
    BottomNavigationBarComponent
  ]
})
export class BottomNavigationBarModule { }
