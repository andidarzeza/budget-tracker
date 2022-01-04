import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absoluteValue'
})
export class AbsoluteValuePipe implements PipeTransform {

  transform(value: number, args?: any[]): unknown {    
    return Math.abs(value);
  }

}
