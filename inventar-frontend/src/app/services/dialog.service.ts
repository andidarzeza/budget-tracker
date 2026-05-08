import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from 'ngx-toastr';
import { filter, takeUntil } from 'rxjs/operators';
import {
  CREATE_DIALOG_DESKTOP_CONFIGURATION,
  CREATE_DIALOG_MOBILE_CONFIGURATION,
} from 'src/environments/environment';
import { ConfirmComponent } from '../shared/confirm/confirm.component';
import { BreakpointService } from './breakpoint.service';
import { Unsubscribe } from '../shared/unsubscribe';

export interface ConfirmDialogHandler {
  onSuccess: Function;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService extends Unsubscribe {
  readonly dialog = inject(MatDialog);
  private readonly breakpointService = inject(BreakpointService);

  openDialog(component: ComponentType<any>, data?: any): ConfirmDialogHandler {
    const mobile = this.breakpointService.matchesMobileCreateLayout();
    const configuration = {
      data: data,
      panelClass: mobile ? ['create-dialog', 'create-dialog--fullscreen'] : ['create-dialog'],
      ...(mobile ? CREATE_DIALOG_MOBILE_CONFIGURATION : CREATE_DIALOG_DESKTOP_CONFIGURATION),
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
      disableClose: CREATE_DIALOG_DESKTOP_CONFIGURATION.disableClose,
    };

    return {
      onSuccess: (callable: Function) => {
        this.dialog.open(ConfirmComponent, configuration)
          .afterClosed()
          .pipe(takeUntil(this.unsubscribe$), filter((update) => update))
          .subscribe(() => callable.call(this));
      }
    }
  }
}
