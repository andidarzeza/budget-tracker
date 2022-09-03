import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'and-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements AfterViewInit {

  showPrefixContainer = true;
  showSuffixContainer = true;
  constructor() { }

  ngAfterViewInit(): void {
    const prefix = document.querySelector("[prefix]");
    const suffix = document.querySelector("[suffix]");
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
