import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  SECOND = 1000;
  MINUTE = 60 * this.SECOND;
  HOUR = 60 * this.MINUTE;
  DAY = 24 * this.HOUR;
  MONTH = 30 * this.DAY;
  YEAR = 12 * this.MONTH;

  transform(stringDate: string, ...args: any[]): any {
    const now = new Date().getTime();
    const date = new Date(stringDate).getTime();
    const diff = now - date;
    
    if(diff < 10 * this.SECOND) return 'just now';
    else if(diff < 2 * this.MINUTE) return 'a minute ago';
    else if(diff < this.HOUR) return Math.floor(diff / (1000 * 60)) + ' minutes ago';
    else if(diff < 2 * this.HOUR) return 'an hour ago';
    else if(diff < this.DAY) return Math.floor(diff / (1000 * 60 * 60)) + ' hours ago';
    else if(diff < 2 * this.DAY) return 'a day ago';
    else if(diff < this.MONTH) return Math.floor(diff / (this.DAY)) + ' days ago';
    else if(diff < 2 * this.MONTH) return 'a month ago';
    else if(diff < this.YEAR) return Math.floor(diff / (this.MONTH)) + ' months ago';
    else if(diff < 2 * this.YEAR) return 'a year ago';
    else return Math.floor(diff / (this.YEAR)) + ' years ago';
  }

}
