import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements AfterViewInit, OnChanges {
  @Input() checked: boolean;
  @Output() onValueChange = new EventEmitter();
  toggleBallId = uuidv4();
  private toggleElement;
  constructor() { }

  ngOnChanges(): void {
    this.animateToggle();    
  }

  ngAfterViewInit(): void {
    this.toggleElement = document.getElementById(this.toggleBallId);
    this.animateToggle();
  }

  toggle(event): void {
    event.stopPropagation();
    if (this.toggleElement) {
      this.checked = !this.checked;
      this.animateToggle();
      this.onValueChange.emit(this.checked);
    }
  }

  animateToggle(): void {
    if (this.toggleElement) {
      const value = this.checked ? 'calc(100% - 2px)' : 'calc(0% + 2px)';
      this.toggleElement.style.transform = `translate(${value}, -50%)`;
    }
  }

}
