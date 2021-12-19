import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {

  ngOnInit(): void {
  }

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, public sharedService: SharedService) { }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  confirm(confirm?: boolean): void {
    this.dialogRef.close(confirm);
  }
}
