import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingsRoutingModule } from './settings-routing.module';
import { DynamicDropdownModule } from './dynamic-dropdown/dynamic-dropdown.module';
import { DropdownModule } from 'src/app/template/shared/dropdown/dropdown.module';
import { AppearanceModule } from './appearance/appearance.module';
import { AccountModule } from './account/account.module';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MatIconModule,
    MatCardModule,
    DynamicDropdownModule,
    MatSlideToggleModule,
    DropdownModule,
    AppearanceModule,
    AccountModule
  ]
})
export class SettingsModule { }
