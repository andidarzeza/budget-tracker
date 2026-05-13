import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { PillButtonComponent } from '../pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from '../tooltip-mobile-guard/tooltip-imports';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  imports: [MatButtonModule, MatIconModule, IconButtonComponent, PillButtonComponent, ...TOOLTIP_IMPORTS],
})
export class ConfirmComponent {
  readonly dialogRef = inject<MatDialogRef<ConfirmComponent>>(MatDialogRef);

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
