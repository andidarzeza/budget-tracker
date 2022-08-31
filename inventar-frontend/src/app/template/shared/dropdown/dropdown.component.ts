import { Component, Input } from '@angular/core';
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
  @Input() options: DropdownOption[];
  constructor(
    public sharedService: SharedService
  ) { }
}
