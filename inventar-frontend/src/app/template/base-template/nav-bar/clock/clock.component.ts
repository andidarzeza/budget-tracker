import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css'],
  imports: [CommonModule],
})
export class ClockComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  currentDate = new Date();

  ngOnInit(): void {
    timer(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.currentDate = new Date()));
  }
}
