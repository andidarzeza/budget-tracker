import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { History } from 'src/app/models/models';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css']
})
export class HistoryDetailsComponent extends Unsubscribe implements OnInit, OnChanges {

  @Input() historyId: string;
  public history$: Observable<History>;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private historyService: HistoryService,
    public sharedService: SharedService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.historyId && !changes.historyId.firstChange) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    if (!this.historyId) {
      return;
    }
    this.history$ = this.historyService.findOne(this.historyId).pipe(
      takeUntil(this.unsubscribe$)
    );
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

}
