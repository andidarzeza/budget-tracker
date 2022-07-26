import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'custom-option',
  templateUrl: './custom-option.component.html',
  styleUrls: ['./custom-option.component.css']
})
export class CustomOptionComponent implements OnInit, OnDestroy {

  @Input() displayActions: boolean = true;
  @Input() item: string;
  @Output() onSelect = new EventEmitter<string>();
  @Input() checked=false;
  private _subject = new Subject();
  constructor(
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.communicationService
      .selectAllObservable
      .pipe(takeUntil(this._subject))
      .subscribe((isChecked: boolean) => this.checked = isChecked);
  }

  select(): void {
    this.checked = !this.checked;    
    this.onSelect.emit(this.item);
  }

  ngOnDestroy(): void {
    this._subject.next();
    this._subject.complete();
  }

}
