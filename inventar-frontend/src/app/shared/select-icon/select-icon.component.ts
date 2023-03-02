import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
            animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    style({left: 0 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ left: 0 }),
            animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    style({ left: '100%' }))
          ]
        )
      ]
    )
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: SelectIconComponent
  }]
})
export class SelectIconComponent implements ControlValueAccessor {
  showIconSelect = false;

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

  value: string;
  disabled: boolean;

  constructor(
    public sharedService: SharedService
  ) { }

  onChange: (value: string) => void;

  onTouched: () => void;

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  open(): void {
    this.showIconSelect = true;
  }

  close(): void {
    this.showIconSelect = false;
  }

  select(icon: string): void {
    this.value = icon;
    this.onChange(icon);    
    this.close();
  }

}
