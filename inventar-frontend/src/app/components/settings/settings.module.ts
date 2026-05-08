import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    MatIconModule,
    MatSlideToggleModule,
    SelectInputComponent
  ]
})
export class SettingsModule { }
