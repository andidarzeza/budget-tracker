import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/services/shared.service';
import { StatisticsService } from 'src/app/services/statistics.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  page = 0;
  size = 10;
  totalItems;
  totalRequests = 0;
  theme = 'light';
  displayedColumns: string[] = ['index', 'firstName', 'lastName', 'numberOfBooksRead'];
  dataSource: any[] = [];
  constructor(public sharedService: SharedService, private statisticsService: StatisticsService, public dialog: MatDialog, private toaster: ToastrService) { }

  ngOnInit(): void {
    this.query();
  }

  paginatorEvent(event: any): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
  }

  query(): void {
    this.totalRequests++;
    this.sharedService.activateLoadingSpinner();
    this.statisticsService.getRankingTable(this.page, this.size).subscribe((res: any) => {
      // this.dataSource = res?.body.associates;
      // this.totalItems = res?.body.count;
      this.dataSource = res;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    },
    (error: any) => {
      this.toaster.error(error.message, "ERROR");
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);
    });
  }

  // openAssociateInfo(id: string): void {    
  //   const dialogRef = this.dialog.open(AssociateInfoComponent, {
  //     data: id,
  //     width: '1000px',
  //     maxHeight: '714px',
  //     disableClose: true,
  //     panelClass: this.sharedService.theme + '-class'
  //   });

  //   dialogRef.afterClosed().subscribe(() => {
  //     this.query();
  //   });
  // }
  
  refreshData(): void {
    this.query();
  }

}
