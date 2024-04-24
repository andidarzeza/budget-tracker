import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { slideDownUp } from './animations';
import { DropdownOption } from './models';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  animations: [slideDownUp]
})
export class DropdownComponent {
  @Input() showOptions = false;
  @Input() title: string;
  @Input() selectedTab: string;
  @Input() options: DropdownOption[];
  @Input() path: string;
  @Output() onNavigation = new EventEmitter();
  constructor(
    public sharedService: SharedService,
    private router: Router
  ) { }

  select(path: string): void {
    if(this.selectedTab != path) {
      this.onNavigation.emit(path);
    }

    this.router.navigate([this.path]);
    
  }
}
