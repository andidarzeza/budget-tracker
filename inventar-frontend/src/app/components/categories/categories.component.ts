import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SpendingCategory } from 'src/app/models/SpendingCategory';
import { CategoriesService } from 'src/app/services/categories.service';
import { SharedService } from 'src/app/services/shared.service';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, TOASTER_POSITION } from 'src/environments/environment';
import { AddCategoryComponent } from './add-category/add-category.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

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
export class CategoriesComponent implements OnInit, OnDestroy {
  pageSizeOptions: number[] = PAGE_SIZE_OPTIONS;
  page = 0;
  size = PAGE_SIZE;
  totalItems;
  totalRequests = 0;
  categoriesType: string = 'spendings';
  theme = 'light';
  displayedColumns: string[] = ['icon', 'name', 'description', 'actions'];
  dataSource: SpendingCategory[] = [];
  private categoriesSubscription: Subscription = null;
  private deleteSubscription: Subscription = null;
  constructor(public sharedService: SharedService, private categoriesService: CategoriesService, public dialog: MatDialog, private toaster: ToastrService) { }

  ngOnInit(): void {
    this.query();
  }

  paginatorEvent(event: PageEvent): void {
    this.size = event?.pageSize;
    this.page = event?.pageIndex;
    this.query();
  }

  query(): void {
    this.totalRequests++;
    this.sharedService.activateLoadingSpinner();
    this.unsubscribe(this.categoriesSubscription);
    this.categoriesSubscription =  this.categoriesService.findAll(this.page, this.size, this.categoriesType).subscribe((res: HttpResponse<any>) => {
      this.dataSource = res?.body.categories;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);     
    });
  }

  openDialog(spendingCategory?: SpendingCategory): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      data: {spendingCategory, categoriesType: this.categoriesType},
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
        this.delete(id);
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
  
  refreshData(): void {
    this.query();
  }

  openDeleteOption(id: string): void {
    const del = document.getElementById(`${id}-delete`) as HTMLElement;
    const icn = document.getElementById(`${id}-icon`) as HTMLElement;
    const icn_cnt = document.getElementById(`${id}-icon-cnt`) as HTMLElement;
    if(del && icn_cnt && icn) {
      del.style.width = '39.4px';
      del.style.padding = '10px';
      icn.style.width = '0';
      icn_cnt.style.paddingLeft = '0';
      icn_cnt.style.paddingRight = '0';
    }
  }

  delete(id: string): void {
    this.unsubscribe(this.deleteSubscription);
    this.deleteSubscription = this.categoriesService.delete(id).subscribe(() => {
      this.query();
      this.toaster.info("Element deleted successfully", "Success", {timeOut: 7000, positionClass: TOASTER_POSITION});
    });
  }

  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }

  changeCategoriesType(value: string): void {
    const underline = document.getElementById("tab-underline");
    if(value === 'spendings') {
      underline.style.transform = "translateX(0)";
    } else {
      underline.style.transform = "translateX(297px)";
    }
    this.categoriesType = value;
    this.page = 0;
    this.query();
  }

  private unsubscribe(subscription: Subscription): void {
    if(subscription) {
      subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe(this.categoriesSubscription);
    this.unsubscribe(this.deleteSubscription);
  }
}
