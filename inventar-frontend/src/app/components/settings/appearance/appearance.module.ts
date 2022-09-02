import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppearanceComponent } from './appearance.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToggleModule } from 'src/app/template/shared/toggle/toggle.module';



@NgModule({
  declarations: [AppearanceComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    ToggleModule
  ],
  exports: [
    AppearanceComponent
  ]
})
export class AppearanceModule { }
