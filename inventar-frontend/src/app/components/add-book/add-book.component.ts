import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, PatternValidator, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IBook } from 'src/app/models/IBook';
import { BookService } from 'src/app/services/book.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {

  private mode = '';
  private id = '';
  buttonText = 'Shto Liber';
  constructor(public sharedService: SharedService, private toaster: ToastrService, public dialogRef: MatDialogRef<AddBookComponent>, private formBuilder: FormBuilder, private bookService: BookService,
    @Inject(MAT_DIALOG_DATA) public book: IBook) {}

  bookGroup:FormGroup = this.formBuilder.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    numberOfPages: [null, Validators.required],
    year: [null, Validators.required],
    stock: [null, Validators.required]
  });
  ngOnInit(): void {
    if(this.book) {
      this.mode = 'edit';
      this.id = this.book.id;
      this.buttonText = 'Perditeso Liber';
      this.bookGroup.patchValue(this.book);
    }else{
      this.mode = 'add';
    }
    
  }

  addBook(): void {
    if(this.bookGroup.valid){
      if(this.mode === 'edit') {
        let book = this.bookGroup.value;
        book["id"] = this.id;
        this.bookService.updateBook(book).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Libri u perditesua me sukses", "Sukses!", {
            timeOut: 7000
          });
        });
      } else {
        this.bookService.addBook(this.bookGroup.value).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Libri u shtua me sukses", "Sukses!", {
            timeOut: 7000
          });    
        });
      }
    }
  }

  closeDialog(update: boolean): void {
    this.dialogRef.close(update);
  }


}
