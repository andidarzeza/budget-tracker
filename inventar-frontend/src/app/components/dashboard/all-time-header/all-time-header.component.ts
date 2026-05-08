import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'all-time-header',
  templateUrl: './all-time-header.component.html',
  styleUrls: ['./all-time-header.component.css'],
  imports: [MatIconModule],
})
export class AllTimeHeaderComponent implements OnInit {
  date = new Date();
  from = new Date(this.date.getFullYear(), 0, 1);
  to = new Date(this.date.getFullYear() + 1, 0, 1);

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

  ngOnInit(): void {
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
