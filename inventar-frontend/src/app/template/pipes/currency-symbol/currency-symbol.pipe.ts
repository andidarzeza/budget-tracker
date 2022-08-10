import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return getCurrencySymbol(value, "narrow");
  }

}
