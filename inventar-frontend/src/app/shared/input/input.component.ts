import { AfterViewInit, Component, Input } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'and-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements AfterViewInit {
  @Input() placeholder = "";
  inputContainerId = uuidv4();
  showPrefixContainer = true;
  showSuffixContainer = true;
  constructor() { }

  ngAfterViewInit(): void {
    const container = document.getElementById(this.inputContainerId);
    const prefix = container.querySelector("[prefix]");
    const suffix = container.querySelector("[suffix]");
    if (prefix) {
      this.showPrefixContainer = true;
    } else {
      this.showPrefixContainer = false;
    }
    if (suffix) {
      this.showSuffixContainer = true;
    } else {
      this.showSuffixContainer = false;
    }
    
  }

}
