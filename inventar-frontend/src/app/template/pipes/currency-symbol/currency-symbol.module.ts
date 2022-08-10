import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencySymbolPipe } from './currency-symbol.pipe';



@NgModule({
  declarations: [CurrencySymbolPipe],
  imports: [
    CommonModule
  ],
  exports: [CurrencySymbolPipe]
})
export class CurrencySymbolModule { }
