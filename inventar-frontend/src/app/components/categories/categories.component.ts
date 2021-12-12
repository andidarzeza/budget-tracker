import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IAssociate } from 'src/app/models/IAssociate';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { AssociateService } from 'src/app/services/associate.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { AddAssociateComponent } from '../add-associate/add-associate.component';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { AssociateInfoComponent } from '../associate-info/associate-info.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
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
export class CategoriesComponent implements OnInit {

  page = 0;
  size = 10;
  totalItems;
  totalRequests = 0;
  theme = 'light';
  displayedColumns: string[] = ['icon', 'name', 'description', 'actions'];
  dataSource: IAssociate[] = [];
  constructor(public sharedService: SharedService, private categoriesService: CategoriesService, public dialog: MatDialog, private toaster: ToastrService) { }

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
    this.categoriesService.findAll(this.page, this.size).subscribe((res: HttpResponse<any>) => {
      this.dataSource = res?.body.categories;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openDialog(spendingCategory?: SpendingCategory): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      data: spendingCategory,
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
        this.categoriesService.delete(id).subscribe((res: any) => {
          this.query();
          this.toaster.info("Elementi u hoq me sukses", "Sukses", {timeOut: 7000});
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

  editAssociate(spendingCategory: SpendingCategory): void {
    this.openDialog(spendingCategory);
  }

  openAssociateInfo(id: string): void {    
    const dialogRef = this.dialog.open(AssociateInfoComponent, {
      data: id,
      width: '1000px',
      maxHeight: '714px',
      disableClose: true,
      panelClass: this.sharedService.theme + '-class'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.query();
    });
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
    this.categoriesService.delete(id).subscribe((res: any) => {
      this.query();
      this.toaster.info("Elementi u hoq me sukses", "Sukses", {timeOut: 7000});
    });
  }

  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }
}
