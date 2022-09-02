import { Component, OnInit } from '@angular/core';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements OnInit {
  toggled: boolean = false;
  toggleBallId = uuidv4();
  constructor() { }

  ngOnInit(): void {
  }

  toggle(): void {
    this.toggled = !this.toggled;
    const element = document.getElementById(this.toggleBallId);
    if(element) {
      if(this.toggled) {
        element.style.transform = "translate(calc(-100% - 2px), -50%)";
        element.style.left = "100%";
      } else {
        element.style.transform = "translate(0%, -50%)";
        element.style.left = "2px";
      }
    }
  }

}
