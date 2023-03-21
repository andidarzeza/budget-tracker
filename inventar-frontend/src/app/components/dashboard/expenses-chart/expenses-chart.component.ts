import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Chart, registerables } from 'chart.js';
import { ChartUtils } from 'src/app/utils/chart';
import { ThemeService } from 'src/app/services/theme.service';
import { DailyExpenseDTO } from 'src/app/models/models';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'expenses-chart',
  templateUrl: './expenses-chart.component.html',
  styleUrls: ['./expenses-chart.component.css']
})
export class ExpensesChartComponent extends Unsubscribe implements OnInit, OnChanges {
  chart: Chart;
  @Input() dailyExpensesLabels: string[];
  @Input() dailyExpenses: DailyExpenseDTO[];

  constructor(
    public sharedService: SharedService,
    public chartUtil: ChartUtils,
    private themeService: ThemeService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.dailyExpenses && !changes?.dailyExpenses?.firstChange) {
      this.createDailyChart();
    }
  }

  ngOnInit(): void {
    Chart.register(...registerables);
    this.listenForColorChange();
  }

  private createDailyChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    const color = localStorage.getItem("themeColor");
    const chartBackgoundColor = this.getChartBackgroundColor(color);
    // this.chart = this.chartUtil.createChart("daily-chart", {
    //   type: 'line',
    //   colors: ['#ff6347'],
    //   labels: this.dailyExpensesLabels?.map(label => {
        
    //     const array = label.split("-");
    //     if (array.length == 3) {
    //       return array[0] + "/" + array[1] + "/" + array[2].slice(-2);
    //     } else {
    //       return array[0] + "/" + array[1].slice(-2);
    //     }


    //   }),
    //   showGridLines: true,
    //   datasets: [{
    //     label: 'Money Spent',
    //     data: this.getDailyExpensesData(),
    //     fill: true,
    //     tension: 0.2,
    //     backgroundColor: [chartBackgoundColor],
    //     borderColor: [color],
    //     pointBackgroundColor: color,
    //     borderWidth: 1
    //   }]
    // });
  }

  private listenForColorChange(): void {
    this.themeService.colorChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((color: string) => {      
        this.sharedService.changeColor(this.chart, this.getChartBackgroundColor(color), color);
      });
  }

  private getChartBackgroundColor(color: string): string {
    return color.substring(0, color.length - 2) + '0.5)';
  }

  private getDailyExpensesData(): number[] {
    return this.dailyExpensesLabels?.map((label: string) => {
      const filtered: DailyExpenseDTO[] = this.dailyExpenses?.filter((dailyExpenseDTO: DailyExpenseDTO) => dailyExpenseDTO._id === label);
        return filtered?.length !== 0 ? filtered[0].dailyExpense : 0;

    });
  }
}
