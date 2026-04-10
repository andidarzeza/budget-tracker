import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnWidth'
})
export class ColumnWidthPipe implements PipeTransform {

  transform(_type: string, columnsSize: number): number {
    return 100 / columnsSize;
  }

}
