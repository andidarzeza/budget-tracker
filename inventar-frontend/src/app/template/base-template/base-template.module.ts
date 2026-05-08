import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTemplateComponent } from './base-template.component';
import { NavBarModule } from './nav-bar/nav-bar.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SideBarModule } from './side-bar/side-bar.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BottomNavigationBarModule } from './bottom-navigation-bar/bottom-navigation-bar.module';
import { SpinnerModule } from '../shared/spinner/spinner.module';



@NgModule({
  declarations: [BaseTemplateComponent],
  imports: [
    CommonModule,
    NavBarModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    SideBarModule,
    BottomNavigationBarModule,
    SpinnerModule
  ],
  exports: [
    BaseTemplateComponent
  ]
})
export class BaseTemplateModule { }
