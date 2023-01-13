import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { History } from 'src/app/models/models';
import { HistoryService } from 'src/app/services/pages/history.service';
import { SharedService } from 'src/app/services/shared.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css']
})
export class HistoryDetailsComponent extends Unsubscribe {

  @Input() historyId: string;
  public history$: Observable<History>;
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private historyService: HistoryService,
    public sharedService: SharedService
  ) {
    super();
    this.history$ = this.historyService.findOne(this.historyId);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

}
