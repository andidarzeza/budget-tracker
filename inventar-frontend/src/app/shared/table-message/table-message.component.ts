import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from 'src/app/services/shared.service';

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
  readonly sharedService = inject(SharedService);

  @Input() total: number;
}
