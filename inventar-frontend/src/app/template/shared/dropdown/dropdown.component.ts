import { Component, OnInit } from '@angular/core';
import { slideDownUp } from './animations';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  animations: [slideDownUp]
})
export class DropdownComponent implements OnInit {
  showOptions = true;
  constructor() { }
  options: string[] = ['Brightnes', 'Color', 'Theme', 'Language', 'Size']
  ngOnInit(): void {
  }


}
