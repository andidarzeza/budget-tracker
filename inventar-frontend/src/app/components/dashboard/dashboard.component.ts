import { AfterViewInit, Component } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { ChartUtils } from 'src/app/utils/chart';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, takeUntil } from 'rxjs/operators';
import { DashboardDTO, RangeType, TimelineExpenseDTO, TimelineIncomeDTO } from 'src/app/models/models';
import { SideBarService } from 'src/app/services/side-bar.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { Chart, registerables } from 'chart.js';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { inOutAnimation } from 'src/app/animations';
import { Observable, of } from 'rxjs';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [inOutAnimation]
})
export class DashboardComponent extends Unsubscribe implements AfterViewInit {

  from: Date;
  to: Date;

  portfolio: {title: string, value: string}[] = [
    {"title": "Incomes", "value": "incomesEUR"},
    {"title": "Average Income", "value": "averageIncomesEUR"},
    {"title": "Expenses", "value": "expensesEUR"},
    {"title": "Average Expense", "value": "averageExpensesEUR"}
  ];

  selectedRange: RangeType = "MONTH";
  ranges: RangeType[] = ["DAY", "MONTH", "YEAR", "MAX"];

  dashboardData$: Observable<DashboardDTO>;

  ngAfterViewInit(): void {
    this.routeSpinnerService.stopLoading();
    Chart.register(...registerables);
    this.chartUtil.createDoughnutChart("category-chart");
    this.chartUtil.createChart("line-chart");
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
      .subscribe((timeline: TimelineExpenseDTO[]) => {
        this.updateLineChartLabels();
        this.updateTimelineData(timeline);
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


  private updateTimelineData(timeline: any[]): void {
    if(this.selectedRange == "MONTH") {
      const currentDaysInSelectedMonth = this.getDaysInMonth(this.from.getFullYear(), this.from.getMonth() + 1);
      const data = [];
      const nonEmptyDays = timeline?.map(t => +t?._id);
      const mappingField = "dailyExpense";
      for(let i = 1;i <= currentDaysInSelectedMonth; i++) {
        
        if(nonEmptyDays.includes(i)) {
          data.push(timeline[nonEmptyDays.indexOf(i)][mappingField])
        } else {
          data.push(0);
        }
      }
      this.chartUtil.updateTimelineData(data);
    }

    if(this.selectedRange == "DAY") {
      const currentHours = this.getHourLabels();
      const data = [];
      const nonEmptyHours = timeline?.map(t => +t?._id);
      const mappingField = "dailyExpense";
      for(let i = 1;i <= currentHours.length; i++) {
        if(nonEmptyHours.includes(i)) {
          data.push(timeline[nonEmptyHours.indexOf(i)][mappingField])
        } else {
          data.push(0);
        }
      }
      this.chartUtil.updateTimelineData(data);
    }

    if(this.selectedRange == "YEAR") {
      const currentYears = this.getYearLabels();
      const data = [];
      const nonEmptyYears = timeline?.map(t => +t?._id);
      const mappingField = "dailyExpense";
      for(let i = 1;i <= currentYears.length; i++) {
        if(nonEmptyYears.includes(i)) {
          data.push(timeline[nonEmptyYears.indexOf(i)][mappingField])
        } else {
          data.push(0);
        }
      }
      this.chartUtil.updateTimelineData(data);
    }


  }

  private getHourLabels(): string[] {
    return [
      "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
      "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
    ]
  }

  private getYearLabels(): string[] {
    return [
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
    ]
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
