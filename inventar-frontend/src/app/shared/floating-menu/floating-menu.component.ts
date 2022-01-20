import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FloatingMenuConfig } from './FloatingMenuConfig';

@Component({
  selector: 'app-floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.css']
})
export class FloatingMenuComponent implements OnInit {

  @Input() public floatingMenu: FloatingMenuConfig;

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
  }

  executeAction(action: Function): void {
    action.call(this);
  }

}
