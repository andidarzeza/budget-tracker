import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CREATE_DIALOG_CONFIGURATION } from 'src/environments/environment';
import { ConfirmComponent } from '../shared/confirm/confirm.component';
import { Unsubscribe } from '../shared/unsubscribe';
import { SharedService } from './shared.service';

export interface ConfirmDialogHandler {
  onSuccess: any;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService extends Unsubscribe {


  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService
  ) {
    super();
  }

  openDialog(component: ComponentType<any>, data?: any): ConfirmDialogHandler {
    const configuration = {
      data: data,
      panelClass: [this.sharedService.theme + '-class', 'create-dialog'],
      ...CREATE_DIALOG_CONFIGURATION
    };

    return {
      onSuccess: (callable: any) => {
        this.dialog.open(component, configuration)
          .afterClosed()
          .pipe(takeUntil(this.unsubscribe$), filter((update) => update))
          .subscribe(() => callable.call());
      }
    }
  }


  openConfirmDialog(): ConfirmDialogHandler {
    const configuration = {
      panelClass: 'delete-confirmation',
      disableClose: CREATE_DIALOG_CONFIGURATION.disableClose,
    };

    return {
      onSuccess: (callable: any) => {
        this.dialog.open(ConfirmComponent, configuration)
          .afterClosed()
          .pipe(takeUntil(this.unsubscribe$), filter((update) => update))
          .subscribe(() => callable.call());
      }
    }
  }
}
