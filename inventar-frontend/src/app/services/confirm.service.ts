import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../components/confirm/confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private dialog: MatDialog) { }
  private dialogRef = null;
  openConfirmDialog(): void  {
    this.dialogRef = this.dialog.open(ConfirmComponent, {
      width: '300px',
      disableClose: true
    });
  }

  close(): void {
    if(this.dialogRef) {
      this.dialogRef.close();
    }
  }


}
