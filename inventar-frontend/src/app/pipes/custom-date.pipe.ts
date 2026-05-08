import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  private static readonly FORMAT = 'dd/MM/yyyy HH:mm';
  private readonly locale = inject(LOCALE_ID);

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
