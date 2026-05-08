import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { History } from 'src/app/models/models';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css'],
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule],
})
export class HistoryDetailsComponent implements OnInit, OnChanges {
  private readonly historyService = inject(HistoryService);
  readonly sharedService = inject(SharedService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() historyId: string;
  history$: Observable<History>;
  @Output() onCloseAction = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.historyId && !changes.historyId.firstChange) {
      this.loadHistory();
    }
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  private loadHistory(): void {
    if (!this.historyId) return;
    this.history$ = this.historyService
      .findOne(this.historyId)
      .pipe(takeUntilDestroyed(this.destroyRef));
  }
}
