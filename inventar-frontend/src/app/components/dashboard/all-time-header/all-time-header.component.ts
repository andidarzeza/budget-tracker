import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'all-time-header',
  templateUrl: './all-time-header.component.html',
  styleUrls: ['./all-time-header.component.css'],
  imports: [MatIconModule],
})
export class AllTimeHeaderComponent implements OnInit {
  /** "All time" really means "everything". Anchor `from` far enough in the
   *  past that no realistic record falls before it, and `to` far enough in
   *  the future that nothing falls after — the backend then returns every
   *  transaction grouped by `yyyy-MM` for the timeline charts. */
  from = new Date(Date.UTC(1970, 0, 1));
  to = new Date(Date.UTC(2100, 0, 1));

  @Output() onChange = new EventEmitter<{ from: Date; to: Date }>();

  ngOnInit(): void {
    this.onChange.emit({ from: this.from, to: this.to });
  }
}
