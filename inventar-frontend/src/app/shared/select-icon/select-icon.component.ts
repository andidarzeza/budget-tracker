import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'select-icon',
  templateUrl: './select-icon.component.html',
  styleUrls: ['./select-icon.component.css'],
  animations: [
    trigger(
      'slideAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ left: '100%' }),
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    style({left: 0 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ left: 0 }),
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    style({ left: '100%' }))
          ]
        )
      ]
    )
  ]
})
export class SelectIconComponent implements OnInit {
  showIconSelect = false;

  @Output() onSelect = new EventEmitter();

  icons: string[] = [
    'fastfood',
    'build',
    'local_cafe',
    'restaurant',
    'directions_car',
    'local_hospital',
    'favorite',
    'payment',
    'games',
    'person',
    'device_hub',
    'create',
    'settings',
    'delete_sweep',
    'drafts',
    'filter_list',
    'flag',
    'font_download',
    'forward',
    'gesture',
    'how_to_reg',
    'how_to_vote',
    'inbox',
    'link',
    'link_off',
    'markunread',
    'move_to_inbox',
    'next_week'
  ];

  constructor(
    public sharedService: SharedService
  ) { }

  @Input() inputPlaceHolder: string;

  ngOnInit(): void {
  }

  open(): void {
    this.showIconSelect = true;
  }

  close(): void {
    this.showIconSelect = false;
  }

  select(icon: string): void {
    this.onSelect.emit(icon);
    this.close();
  }

}
