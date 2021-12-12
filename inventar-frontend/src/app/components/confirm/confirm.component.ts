import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmService } from 'src/app/services/confirm.service';
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
