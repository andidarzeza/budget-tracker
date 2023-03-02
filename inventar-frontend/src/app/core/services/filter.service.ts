import { Injectable } from '@angular/core';
import { FilterOptions } from 'src/app/shared/base-table/table-actions/filter/filter.models';
import { filterMap } from '../filters/filters';
import { TableEntity } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }


  select(filterType: TableEntity): FilterOptions[] {
    return filterMap.get(filterType);
  }
}
