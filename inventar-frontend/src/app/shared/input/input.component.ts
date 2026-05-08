import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'and-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  imports: [CommonModule],
})
export class InputComponent implements AfterViewInit {
  @Input() placeholder = '';
  readonly inputContainerId = uuidv4();
  showPrefixContainer = true;
  showSuffixContainer = true;

  ngAfterViewInit(): void {
    const container = document.getElementById(this.inputContainerId);
    const prefix = container?.querySelector('[prefix]');
    const suffix = container?.querySelector('[suffix]');
    this.showPrefixContainer = !!prefix;
    this.showSuffixContainer = !!suffix;
  }
}
