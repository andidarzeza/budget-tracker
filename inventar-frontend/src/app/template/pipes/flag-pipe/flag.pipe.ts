import { Pipe, PipeTransform } from '@angular/core';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

@Pipe({
  name: 'flag'
})
export class FlagPipe implements PipeTransform {

  transform(country: string, ...args: unknown[]): unknown {
    return getUnicodeFlagIcon(country);
  }
  
}
