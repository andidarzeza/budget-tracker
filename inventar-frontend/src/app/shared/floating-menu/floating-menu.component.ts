import { Component, Input, OnInit } from '@angular/core';
import { FloatingMenuConfig } from './FloatingMenuConfig';

@Component({
  selector: 'app-floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.css']
})
export class FloatingMenuComponent implements OnInit {

  @Input() public floatingMenu: FloatingMenuConfig;

  constructor() { }

  ngOnInit(): void {
  }

  executeAction(action: Function): void {
    action.call(this);
  }

}
