import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Incoming } from 'src/app/models/Incoming';
import { IncomingsService } from 'src/app/services/incomings.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_POSITION } from 'src/environments/environment';
import { AddIncomingComponent } from '../add-incoming/add-incoming.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-incomings',
  templateUrl: './incomings.component.html',
  styleUrls: ['./incomings.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class IncomingsComponent implements OnInit {
  page = 0;
  size = 10;
  totalItems;
  totalRequests = 0;
  theme = 'light';
  sort = "createdTime,desc";
  displayedColumns: string[] = ['date', 'name', 'description', 'category', 'incoming', 'actions'];
  incomings: Incoming[] = [];
  constructor(public sharedService: SharedService, private incomingsService: IncomingsService, public dialog: MatDialog, private toaster: ToastrService) { }

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
    this.incomingsService.findAll(this.page, this.size, this.sort).subscribe((res: HttpResponse<any>) => {
      this.incomings = res?.body.incomings;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openDialog(incoming?: Incoming): void {
    const dialogRef = this.dialog.open(AddIncomingComponent, {
      data: incoming,
      width: '700px',
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });

    dialogRef.afterClosed().subscribe((update: boolean) => {
      if(update) {
        this.query();
      }
    });
  }


  deleteAssociate(id: string): void {
    this.openConfirmDialog().afterClosed().subscribe((result: any) => {
      if(result) {
        this.incomingsService.delete(id).subscribe((res: any) => {
          this.query();
          this.toaster.info("Elementi u hoq me sukses", "Sukses", {timeOut: 7000, positionClass: TOASTER_POSITION});
        });
      }
    });;
  }

  openConfirmDialog(): MatDialogRef<ConfirmComponent>  {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });
    return dialogRef;
  }

  editAssociate(incoming: Incoming): void {
    this.openDialog(incoming);
  }
  
  refreshData(): void {
    this.query();
  }

  openDeleteOption(id: string): void {
    const del = document.getElementById(`${id}-delete`) as HTMLElement;
    const icn = document.getElementById(`${id}-icon`) as HTMLElement;
    const icn_cnt = document.getElementById(`${id}-icon-cnt`) as HTMLElement;
    if(del &&icn_cnt &&icn) {
      del.style.width = '39.4px';
      del.style.padding = '10px';
      icn.style.width = '0';
      icn_cnt.style.paddingLeft = '0';
      icn_cnt.style.paddingRight = '0';
    }
  }

  delete(id: string): void {
    this.incomingsService.delete(id).subscribe((res: any) => {
      this.query();
      this.toaster.info("Elementi u hoq me sukses", "Sukses", {timeOut: 7000, positionClass: TOASTER_POSITION});
    });
  }

  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }

}
