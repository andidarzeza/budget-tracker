import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  imports: [MatButtonModule, MatIconModule],
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
