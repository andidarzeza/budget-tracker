import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'table-message',
  templateUrl: './table-message.component.html',
  styleUrls: ['./table-message.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('250ms ease-out', style({opacity: 1 }))
          ]
        )
      ]
    )
  ]
})
export class TableMessageComponent {

  @Input() total: number;

  constructor(public sharedService: SharedService) {

  }

}
