import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from 'ngx-toastr';
import { CREATE_DIALOG_CONFIGURATION } from 'src/environments/environment';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog, private sharedService: SharedService) { }

  openDialog(component: ComponentType<any>, data?: any): MatDialogRef<any> {
    return this.dialog.open(component, {
      data: data,
      panelClass: this.sharedService.theme + '-class',
      ...CREATE_DIALOG_CONFIGURATION
    });
  }

  openConfirmDialog(component: ComponentType<any>): MatDialogRef<any> {
    const configuration = {
      disableClose: CREATE_DIALOG_CONFIGURATION.disableClose,
    };
    return this.dialog.open(component, {
      panelClass: this.sharedService.theme + '-class',
      ...configuration
    });
  }
}
