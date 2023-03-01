import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnWidth'
})
export class ColumnWidthPipe implements PipeTransform {

  transform(type: string, columnsSize: number, displayDrawer: boolean): number {    
    if(displayDrawer) {
      if(type == 'Actions') {
        return 0;
      } else {
        return 60/(columnsSize - 1);
      }
    }
    return 100 / columnsSize;
  }

}
