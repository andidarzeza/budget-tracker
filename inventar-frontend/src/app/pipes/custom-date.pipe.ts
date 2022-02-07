import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(stringDate: string, ...args: any[]): any {
    const now = new Date().getTime();
    const date = new Date(stringDate).getTime();
    const diff = now - date
    if(diff < 10 * 1000) return 'a few seconds ago';
    else if(diff < 1 * 60 * 1000) return 'a minute ago';
    else if(diff < 2 * 60 * 1000) return 'a few minutes ago';
    else if(diff < 24 * 60 * 60 * 1000) return 'a few hours ago';
    return stringDate
  }

}
