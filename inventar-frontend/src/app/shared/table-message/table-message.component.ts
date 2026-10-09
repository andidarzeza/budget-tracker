import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'table-message',
  templateUrl: './table-message.component.html',
  styleUrls: ['./table-message.component.css'],
  imports: [CommonModule, MatIconModule],
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class TableMessageComponent {
  @Input() total: number;
  /** Page name for the title ("No Expenses"). */
  @Input() pageName?: string;
  /** Material symbol shown above the title (the page's own icon). */
  @Input() icon?: string;
}
