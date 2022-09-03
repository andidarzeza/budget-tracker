import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppearanceComponent } from './appearance.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToggleModule } from 'src/app/template/shared/toggle/toggle.module';
import { InputModule } from 'src/app/shared/input/input.module';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [AppearanceComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    ToggleModule,
    InputModule,
    MatIconModule
  ],
  exports: [
    AppearanceComponent
  ]
})
export class AppearanceModule { }
