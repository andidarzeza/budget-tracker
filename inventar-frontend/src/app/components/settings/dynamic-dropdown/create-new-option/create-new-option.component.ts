import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'create-new-option',
  templateUrl: './create-new-option.component.html',
  styleUrls: ['./create-new-option.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        )
      ]
    )
  ]
})
export class CreateNewOptionComponent implements OnInit{
  @Input() appearance: string; 
  @Output() onCreate = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  createMode = false;
  editMode = false;
  constructor(
    private formBuilder: FormBuilder,
    private communicationService: CommunicationService
  ) { }
  ngOnInit(): void {
    this.communicationService.editObservable.subscribe((item: string) => {
      this.editMode = true;
      console.log(item);
      this.item.setValue(item);
    });
  }
  
  public formGroup: FormGroup = this.formBuilder.group({
    item: ["", Validators.required]
  });

  addItem(): void {
    if(this.formGroup.valid) {
        if(this.editMode) {
          this.onEdit.emit(this.item.value);
        } else {
          this.onCreate.emit(this.item.value);
        }
        this.formGroup.reset();
        this.createMode = false;
        this.editMode = false;
    } else {
      console.log("required!");
    }
  }

  create(): void {
    this.createMode = true;
  }

  cancel(): void {
    this.createMode = false;
    this.editMode = false;
    this.formGroup.reset();
  }

  get item() {
    return this.formGroup.get("item");
  }
}
