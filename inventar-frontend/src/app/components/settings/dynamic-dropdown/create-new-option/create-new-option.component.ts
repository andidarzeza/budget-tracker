import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'create-new-option',
  templateUrl: './create-new-option.component.html',
  styleUrls: ['./create-new-option.component.css']
})
export class CreateNewOptionComponent implements OnInit {
  @Input() appearance: string; 
  createMode = false;
  constructor() { }

  ngOnInit(): void {
  }

  create(): void {
    console.log("test");
    this.createMode = true;
  }

  cancel(): void {
    this.createMode = false;
  }

}
