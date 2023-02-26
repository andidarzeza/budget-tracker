import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toggled'
})
export class ToggledPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'translate(calc(100% - 2px), -50%)' : 'translate(2px, -50%)';
  }

}
