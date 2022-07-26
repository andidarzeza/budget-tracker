import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'create-new-option',
  templateUrl: './create-new-option.component.html',
  styleUrls: ['./create-new-option.component.css']
})
export class CreateNewOptionComponent {
  @Input() appearance: string; 
  @Output() onCreate = new EventEmitter<string>();
  createMode = false;
  constructor(
    private formBuilder: FormBuilder
  ) { }
  
  public formGroup: FormGroup = this.formBuilder.group({
    item: ["", Validators.required]
  });

  addItem(): void {
    if(this.formGroup.valid) {
        this.onCreate.emit(this.item.value);
        this.formGroup.reset();
    } else {
      console.log("required!");
    }
  }

  create(): void {
    this.createMode = true;
  }

  cancel(): void {
    this.createMode = false;
  }

  get item() {
    return this.formGroup.get("item");
  }
}
