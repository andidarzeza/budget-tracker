import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'create-footer',
  templateUrl: './create-footer.component.html',
  styleUrls: ['./create-footer.component.css']
})
export class CreateFooterComponent implements OnInit {

  @Input() editMode: boolean;
  @Output() create = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  add(): void {
    this.create.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

}
