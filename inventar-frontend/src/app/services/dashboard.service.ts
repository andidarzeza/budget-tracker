import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { DashboardDTO, Period, RangeType, TimelineExpenseDTO, TimelineIncomeDTO } from '../models/models';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly API_URL: string = `${serverAPIURL}/api/dashboard`;
  
  constructor(
    private http: HttpClient,
    public accountService: AccountService
  ) {}

  getDashboardData(from: Date, to: Date, range: RangeType): Observable<DashboardDTO> {
    const params = new HttpParams()
      .append("from", from.toISOString())
      .append("to", to.toISOString())
      .append("range", range)
      .append("account", this.accountService.getAccount());
    return this.http.get<DashboardDTO>(this.API_URL, {params});
  }

  expensesTimeline(period: Period, type: RangeType): Observable<TimelineExpenseDTO[]> {
    const params = new HttpParams()
      .append("from", period.from.toISOString())
      .append("to", period.to.toISOString())
      .append("range", type)
      .append("account", this.accountService.getAccount());
    return this.http.get<TimelineExpenseDTO[]>(`${this.API_URL}/expenses-timeline`, { params });
  }

  incomesTimeline(period: Period, type: RangeType): Observable<TimelineIncomeDTO[]> {
    const params = new HttpParams()
      .append("from", period.from.toISOString())
      .append("to", period.to.toISOString())
      .append("range", type)
      .append("account", this.accountService.getAccount());
    return this.http.get<TimelineIncomeDTO[]>(`${this.API_URL}/incomes-timeline`, { params });
  }

}
