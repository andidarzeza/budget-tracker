import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribe } from 'src/app/shared/unsubscribe';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent extends Unsubscribe implements OnInit {
  currentDate = new Date();
  constructor() { 
    super();
  }

  ngOnInit(): void {
    timer(0, 1000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.currentDate = new Date());
  }

}
