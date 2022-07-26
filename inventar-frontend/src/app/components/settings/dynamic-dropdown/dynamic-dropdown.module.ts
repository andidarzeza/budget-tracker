import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDropdownComponent } from './dynamic-dropdown.component';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreateNewOptionModule } from './create-new-option/create-new-option.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [DynamicDropdownComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    CreateNewOptionModule,
    MatCheckboxModule
  ],
  exports: [DynamicDropdownComponent]
})
export class DynamicDropdownModule { }
