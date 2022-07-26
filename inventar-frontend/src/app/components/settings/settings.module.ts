import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingsRoutingModule } from './settings-routing.module';
import { DynamicDropdownModule } from './dynamic-dropdown/dynamic-dropdown.module';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MatIconModule,
    MatCardModule,
    DynamicDropdownModule,
    MatSlideToggleModule
  ]
})
export class SettingsModule { }
