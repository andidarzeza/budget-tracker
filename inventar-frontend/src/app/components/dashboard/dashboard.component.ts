import { AfterViewInit, Component, HostListener } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, takeUntil } from 'rxjs/operators';
import { DashboardDTO, RangeType, TimelineExpenseDTO } from 'src/app/models/models';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { inOutAnimation } from 'src/app/animations';
import { Observable, of } from 'rxjs';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({ standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [inOutAnimation]
})
export class DashboardComponent extends Unsubscribe implements AfterViewInit {

  from: Date;
  to: Date;

  selectedRange: RangeType = "MONTH";
  ranges: RangeType[] = ["DAY", "MONTH", "YEAR", "MAX"];

  dashboardData$: Observable<DashboardDTO>;

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
    Chart.register(...registerables);
    this.chartUtil.createDoughnutChart("category-chart");
    this.chartUtil.createChart("line-chart");
    this.chartUtil.resizeDashboardCharts();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.chartUtil.resizeDashboardCharts();
  }

  constructor(
    public dashboardService: DashboardService,
    public chartUtil: ChartUtils,
    private toasterService: ToastrService,
    public sideBarService: SideBarService,
    public navBarService: NavBarService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
  }

  private getDashboardData(): void {
    this.dashboardData$ = this.dashboardService
      .getDashboardData(this.from, this.to, this.selectedRange)
      .pipe(catchError(this.catchError));
  }

  private expensesTimeline(): void {
    this.dashboardService
      .expensesTimeline(this.period, this.selectedRange)
      .pipe(takeUntil(this.unsubscribe$), catchError(this.catchError))
      .subscribe((timeline: TimelineExpenseDTO[] | null) => {
        this.updateLineChartLabels();
        this.updateTimelineData(timeline ?? undefined);
      });
  }

  catchError = () => {
    this.toasterService.error("An Error Occured", "Server Error", TOASTER_CONFIGURATION);
    return of(null);
  }

  onRangeSelect(range: RangeType): void {
    this.selectedRange = range;
    this.updateLineChartLabels();
    this.getDashboardData();
    this.expensesTimeline();
  }

  private updateLineChartLabels(): void {
    this.chartUtil.updateTimelineLabels(this.selectedRange, "line", {year: this.from.getFullYear(), month: this.from.getMonth() + 1});
  }

  onDateSelected(dateRange: {from: Date, to: Date}): void {
    this.from = dateRange.from;
    this.to = dateRange.to;
    this.getDashboardData();
    this.expensesTimeline();
  }


  private updateTimelineData(timeline: TimelineExpenseDTO[] | null | undefined): void {
    if (this.selectedRange === 'MAX') {
      this.chartUtil.updateTimelineDataByCurrency([]);
      return;
    }

    const rows = Array.isArray(timeline) ? timeline : [];
    const currencyLabel = (c: string | null | undefined): string =>
      c && String(c).trim() ? String(c).trim() : 'Other';

    const currencies = [...new Set(rows.map(r => currencyLabel(r.currency)))].sort((a, b) => a.localeCompare(b));

    const valueByKey = new Map<string, number>();
    for (const r of rows) {
      const bucket = this.normalizeTimelineBucketId(r._id);
      const cur = currencyLabel(r.currency);
      valueByKey.set(`${bucket}|${cur}`, r.dailyExpense ?? 0);
    }

    const datasets = currencies.map((cur, idx) => {
      const color = this.chartUtil.lineColorForDatasetIndex(idx);
      const data: number[] = [];
      if (this.selectedRange === 'MONTH') {
        const dim = this.getDaysInMonth(this.from.getFullYear(), this.from.getMonth() + 1);
        for (let day = 1; day <= dim; day++) {
          const key = String(day).padStart(2, '0');
          data.push(valueByKey.get(`${key}|${cur}`) ?? 0);
        }
      } else if (this.selectedRange === 'DAY') {
        for (let h = 0; h < 24; h++) {
          const key = String(h).padStart(2, '0');
          data.push(valueByKey.get(`${key}|${cur}`) ?? 0);
        }
      } else if (this.selectedRange === 'YEAR') {
        for (let m = 1; m <= 12; m++) {
          const key = String(m).padStart(2, '0');
          data.push(valueByKey.get(`${key}|${cur}`) ?? 0);
        }
      }
      return { label: cur, data, borderColor: color, backgroundColor: color };
    });

    this.chartUtil.updateTimelineDataByCurrency(datasets);
  }

  /** Aligns API bucket ids (day/hour/month strings) with padded keys used in the chart. */
  private normalizeTimelineBucketId(raw: string | number | undefined | null): string {
    if (raw === undefined || raw === null) {
      return '';
    }
    const s = String(raw).trim();
    if (!s) {
      return '';
    }
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) {
      return String(n).padStart(2, '0');
    }
    return s;
  }
  
  private getDaysInMonth(year: number, month): number {
    return new Date(year, month, 0).getDate();
  }

  get period() {
    return {
      from: this.from,
      to: this.to
    }
  }

}
