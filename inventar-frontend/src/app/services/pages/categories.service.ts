import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { Category, CategoryType, ResponseWrapper } from '../../models/models';
import { BaseService } from '../../core/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends BaseService<Category> {
  readonly API_URl: string = `${serverAPIURL}/api/categories`;

  incomeCategories(params: HttpParams): Observable<ResponseWrapper> {
    params = params.append('categoryType', CategoryType.INCOME);
    return this.findAll(params);
  }

  expenseCategories(params: HttpParams): Observable<ResponseWrapper> {
    params = params.append('categoryType', CategoryType.EXPENSE);
    return this.findAll(params);
  }

  /**
   * Returns categories for the given account, ordered by how often they've been used
   * (most-used first). Drives the mobile add-expense / add-income picker so the
   * categories the user touches most appear at the top of the grid.
   */
  findByUsage(account: string, categoryType: CategoryType | string): Observable<Category[]> {
    const params = new HttpParams()
      .append('account', account)
      .append('categoryType', String(categoryType));
    return this.http.get<Category[]>(`${this.API_URl}/by-usage`, { params });
  }
}
