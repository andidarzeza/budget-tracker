import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-icon-select',
  templateUrl: './icon-select.component.html',
  styleUrls: ['./icon-select.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('200ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('200ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class IconSelectComponent implements OnInit, OnChanges {
  @ViewChild('container') container;
  constructor(public sharedService: SharedService) { 
    document.addEventListener('click', this.offClickHandler.bind(this)); // bind on doc
  }

  offClickHandler(event:any) {
    if (!this.container.nativeElement.contains(event.target)) { // check click origin
      this.showDropdown = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.selectedIcon) {
      this.selectedIcon = changes?.selectedIcon.currentValue;
    }
  }

  @Output() onIconSelect: EventEmitter<string> = new EventEmitter();
  showDropdown = false;

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

  @Input() selectedIcon = null;

  ngOnInit(): void {
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.onIconSelect.emit(icon);
    this.toggleDropdown();
  }

}
