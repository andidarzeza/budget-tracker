import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDropdownComponent } from './dynamic-dropdown.component';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CustomOptionModule } from './custom-option/custom-option.module';
import { NewOptionModule } from './new-option/new-option.module';



@NgModule({
  declarations: [DynamicDropdownComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    NewOptionModule,
    CustomOptionModule
  ],
  exports: [DynamicDropdownComponent]
})
export class DynamicDropdownModule { }
