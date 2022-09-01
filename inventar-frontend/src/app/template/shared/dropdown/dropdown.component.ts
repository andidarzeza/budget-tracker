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
  showOptions = true;
  @Input() title: string;
  @Input() selectedPath: string;
  @Input() options: DropdownOption[];
  @Output() onNavigation = new EventEmitter();
  constructor(
    public sharedService: SharedService,
    private router: Router
  ) { }

  navigate(path: string): void {
    if(this.selectedPath != path) {
      this.router.navigate([path]);
      this.onNavigation.emit(path);
    }
    
  }
}
