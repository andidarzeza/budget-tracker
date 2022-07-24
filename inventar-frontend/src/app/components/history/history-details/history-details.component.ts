import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { History } from 'src/app/models/History';
import { HistoryService } from 'src/app/services/history.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css']
})
export class HistoryDetailsComponent implements OnInit, OnDestroy {

  @Input() historyId: string;
  public history: History;
  private _subject = new Subject();
  @Output() onCloseAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private historyService: HistoryService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.historyService
      .findOne(this.historyId)
      .pipe(takeUntil(this._subject))
      .subscribe((history: History) => this.history = history);
  }

  closeDrawer(): void {
    this.onCloseAction.emit();
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

  get entity() {
    return this.history?.entity ?? "-";
  }

  get createdTime() {
    return this.history?.date;
  }

  get lastModifiedDate() {
    return this.history?.lastModifiedDate;
  }

  get action() {
    return this.history?.action ?? "-";
  }

  get user() {
    return this.history?.user ?? "-";
  }

  get message() {
    return this.history?.message ?? "no-message";
  }

}
