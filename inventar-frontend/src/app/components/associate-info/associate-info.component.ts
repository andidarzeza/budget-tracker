import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IAssociate } from 'src/app/models/IAssociate';
import { IBook } from 'src/app/models/IBook';
import { AssociateService } from 'src/app/services/associate.service';
import { BookService } from 'src/app/services/book.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-associate-info',
  templateUrl: './associate-info.component.html',
  styleUrls: ['./associate-info.component.css']
})
export class AssociateInfoComponent implements OnInit {

  associate: IAssociate = null;
  associateBooks: any = [];
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  booksAvaible = [];
  newBookFormIsOpened = false;
  assignBookGroup: FormGroup;
  dateNow = Date.now();
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public id: string, public dialogRef: MatDialogRef<AssociateInfoComponent>,
  private associateService: AssociateService, private bookService: BookService, private fb: FormBuilder) { 

    this.assignBookGroup = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      book: [[], Validators.required]
    });
  }

  displayedColumns: string[] = ['title', 'author', 'dateFrom', 'dateTo', 'actions'];


  ngOnInit(): void {
    if(this.id) {
      this.associateService.getAssociate(this.id).subscribe((res: any) => {
        this.associate = res?.body;
        this.getAvailableBooks(this.associate.id);
        this.getAssociateBooks(this.associate.id);
      });
    } else {
      this.dialogRef.close();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  switchNewBookForm(): void {
    if(this.newBookFormIsOpened) {
      this.closeNewBookForm();
    } else {
      this.openNewBookForm();
    }
  }

  closeNewBookForm(): void {
    const newBookElement = document.getElementById("new-book-id") as HTMLElement;
    if(newBookElement) {
      newBookElement.style.height = '0';
      this.newBookFormIsOpened = !this.newBookFormIsOpened;
    }
  }

  openNewBookForm(): void {
    const newBookElement = document.getElementById("new-book-id") as HTMLElement;
    if(newBookElement) {
      newBookElement.style.height = '120px';
      this.newBookFormIsOpened = !this.newBookFormIsOpened;
    }
  }

  getAvailableBooks(id: string): void {
    this.bookService.getAvailableBooks(id).subscribe((res: any) => {
      this.booksAvaible = res.body;
    });
  }

  getAssociateBooks(id: string): void {
    this.associateService.getAssociateBooks(id).subscribe((res: any) => {
      this.associateBooks = res.body;
    });
  }

  addBookToAssociate(): void {
    this.associateService.addBookToAssociate(this.associate.id, this.assignBookGroup.get('book').value, this.assignBookGroup.get('fromDate').value.getTime(), this.assignBookGroup.get('toDate').value.getTime()).subscribe((res: any) => {
      this.associate = res.body;
      this.getAvailableBooks(this.associate.id);
      this.getAssociateBooks(this.associate.id);
      this.assignBookGroup.reset();
    });
  }

  markAsDelivered(id: string): void {
    const elem = document.getElementById(id + 'deliveredDate') as HTMLInputElement;
    const deliveredOn = new Date(elem.value).getTime();
    this.associateService.deliverAssociateBook(this.associate.id, deliveredOn, id).subscribe((res: any) => {
      this.associate = res.body;
      this.getAvailableBooks(this.associate.id);
      this.getAssociateBooks(this.associate.id);
    })
  }

  openConfimationPanel(id: string) {    
    const button = document.getElementById('button' + id) as HTMLElement;
    if(button){
      button.style.display = 'none';
      const actions = document.getElementById(id) as HTMLElement;
      if(actions){
        actions.style.display = 'flex';
      }else{
        button.style.display = 'block';
      }
    }
  }

  closeConfirmationPanel(id: string) {
    const button = document.getElementById('button' + id) as HTMLElement;
    if(button){
      button.style.display = 'flex';
      const actions = document.getElementById(id) as HTMLElement;
      if(actions){
        actions.style.display = 'none';
      }
    }
  }

  displayFn(book: IBook): string {
    return book && book.title ? book.title : '';
  }

}
