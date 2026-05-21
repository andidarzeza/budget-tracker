import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverAPIURL } from 'src/environments/environment';
import { DashboardDTO, Period, RangeType, TimelineExpenseDTO, TimelineIncomeDTO } from '../models/models';
import { toLocalAsUtcIso } from '../utils/local-iso';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  readonly accountService = inject(AccountService);

  readonly API_URL: string = `${serverAPIURL}/api/dashboard`;

  // Backend stores `Expense.createdTime` as `LocalDateTime` (wall-clock,
  // no zone — see `toBareLocalIso`) but this endpoint deserializes the
  // `from`/`to` params as `Instant` (`…Z`, UTC). Naively using
  // `Date.toISOString()` shifts the window by the local UTC offset, so an
  // expense at 22:34 on the 18th ends up under day-19's filter.
  // `toLocalAsUtcIso` keeps the picker's wall-clock digits but tags them
  // as UTC, so day-18 midnight becomes `…T00:00:00Z` regardless of zone.

  getDashboardData(from: Date, to: Date, range: RangeType): Observable<DashboardDTO> {
    const params = new HttpParams()
      .append("from", toLocalAsUtcIso(from))
      .append("to", toLocalAsUtcIso(to))
      .append("range", range)
      .append("account", this.accountService.getAccount());
    return this.http.get<DashboardDTO>(this.API_URL, {params});
  }

  expensesTimeline(period: Period, type: RangeType): Observable<TimelineExpenseDTO[]> {
    const params = new HttpParams()
      .append("from", toLocalAsUtcIso(period.from))
      .append("to", toLocalAsUtcIso(period.to))
      .append("range", type)
      .append("account", this.accountService.getAccount());
    return this.http.get<TimelineExpenseDTO[]>(`${this.API_URL}/expenses-timeline`, { params });
  }

  incomesTimeline(period: Period, type: RangeType): Observable<TimelineIncomeDTO[]> {
    const params = new HttpParams()
      .append("from", toLocalAsUtcIso(period.from))
      .append("to", toLocalAsUtcIso(period.to))
      .append("range", type)
      .append("account", this.accountService.getAccount());
    return this.http.get<TimelineIncomeDTO[]>(`${this.API_URL}/incomes-timeline`, { params });
  }

}
