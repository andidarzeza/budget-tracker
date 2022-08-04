import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CREATE_DIALOG_CONFIGURATION } from 'src/environments/environment';
import { ConfirmComponent } from '../shared/confirm/confirm.component';
import { SharedService } from './shared.service';

export interface ConfirmDialogHandler {
  onSuccess: any;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService implements OnDestroy {

  private _subject = new Subject();

  constructor(public dialog: MatDialog, private sharedService: SharedService) { }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

  openDialog(component: ComponentType<any>, data?: any): ConfirmDialogHandler {
    const configuration = {
      data: data,
      panelClass: this.sharedService.theme + '-class',
      ...CREATE_DIALOG_CONFIGURATION
    };

    return {
      onSuccess: (callable: any) => {
        this.dialog.open(component, configuration)
          .afterClosed()
          .pipe(takeUntil(this._subject), filter((update) => update))
          .subscribe(() => callable.call());
      }
    }
  }


  openConfirmDialog(): ConfirmDialogHandler {
    const configuration = {
      panelClass: this.sharedService.theme + '-class',
      disableClose: CREATE_DIALOG_CONFIGURATION.disableClose,
    };

    return {
      onSuccess: (callable: any) => {
        this.dialog.open(ConfirmComponent, configuration)
          .afterClosed()
          .pipe(takeUntil(this._subject), filter((update) => update))
          .subscribe(() => callable.call());
      }
    }
  }
}
