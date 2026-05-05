import { formatDate } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false,
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  private static readonly FORMAT = 'dd/MM/yyyy HH:mm';

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  transform(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    return formatDate(date, CustomDatePipe.FORMAT, this.locale);
  }

}
