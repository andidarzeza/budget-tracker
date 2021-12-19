import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule
  ]
})
export class SettingsModule { }
