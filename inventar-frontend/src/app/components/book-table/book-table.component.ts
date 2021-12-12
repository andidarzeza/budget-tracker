import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IBook } from 'src/app/models/IBook';
import { BookService } from 'src/app/services/book.service';
import { ConfirmService } from 'src/app/services/confirm.service';
import { SharedService } from 'src/app/services/shared.service';
import { AddBookComponent } from '../add-book/add-book.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-book-table',
  templateUrl: './book-table.component.html',
  styleUrls: ['./book-table.component.css'],
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
export class BookTableComponent implements OnInit {
  page = 0;
  size = 10;
  totalItems = 1550;
  totalRequests = 0;
  displayedColumns: string[] = ['title', 'author', 'numberOfPages', 'stock', 'year', 'actions'];
  dataSource: IBook[] = [];
  constructor(private bookService: BookService, public dialog: MatDialog, private toaster: ToastrService, public sharedService: SharedService) { }

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
    this.bookService.getBooks(this.page, this.size).subscribe((res: HttpResponse<any>) => {
      this.dataSource = res?.body.books;
      this.totalItems = res?.body.count;
      this.totalRequests--;
      this.sharedService.checkLoadingSpinner(this.totalRequests);   
    });
  }

  openDialog(book?: IBook): void {
    const dialogRef = this.dialog.open(AddBookComponent, {
      width: '700px',
      disableClose: true,
      data: book,
      panelClass: this.sharedService.theme + '-class'
    });

    dialogRef.afterClosed().subscribe((update: boolean) => {
      if(update) {
        this.query();
      }
    });
  }

  editBook(book: IBook): void {
      this.openDialog(book);   
  }

  deleteBook(id: string): void {
    this.openConfirmDialog().afterClosed().subscribe((result: any) => {
      console.log(result);
      
      if(result) {
        this.bookService.removeBook(id).subscribe((res: any) => {
          console.log(res);
          
          this.query();
          this.toaster.info("Elementi u hoq me sukses", "Sukses", {timeOut: 7000});
        })
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

  refreshData(): void {
    this.query();
  }

  getHeight(difference: number): number {
    return window.innerHeight - 275 - difference;
  }

}
