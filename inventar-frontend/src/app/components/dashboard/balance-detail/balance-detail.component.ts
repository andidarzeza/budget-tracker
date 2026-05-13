import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';

export interface BalanceDetailData {
  currency: string;
  amount: number;
  hidden: boolean;
}

/**
 * Tiny read-only dialog opened when a balance chip is tapped on mobile —
 * the chip itself truncates long amounts, so this view shows the flag,
 * the currency code spelled out, and the full untruncated balance.
 */
@Component({
  selector: 'balance-detail',
  templateUrl: './balance-detail.component.html',
  styleUrls: ['./balance-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatIconModule, FlagPipe, PillButtonComponent],
})
export class BalanceDetailComponent {
  readonly data = inject<BalanceDetailData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<BalanceDetailComponent>);

  close(): void {
    this.ref.close();
  }
}
