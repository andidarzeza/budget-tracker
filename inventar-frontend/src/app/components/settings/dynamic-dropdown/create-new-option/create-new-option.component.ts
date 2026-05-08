import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { inAnimation } from '../animations';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'create-new-option',
  templateUrl: './create-new-option.component.html',
  styleUrls: ['./create-new-option.component.css'],
  animations: [inAnimation],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    LabeledFormInputComponent,
  ],
})
export class CreateNewOptionComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly communicationService = inject(CommunicationService);

  @Input() appearance: string;
  @Output() onCreate = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();

  createMode = false;
  editMode = false;

  formGroup: FormGroup = this.formBuilder.group({
    item: ['', Validators.required],
  });

  ngOnInit(): void {
    this.communicationService.editObservable.subscribe((item: string) => {
      this.editMode = true;
      this.item.setValue(item);
    });
  }

  addItem(): void {
    if (this.formGroup.valid) {
      if (this.editMode) {
        this.onEdit.emit(this.item.value);
      } else {
        this.onCreate.emit(this.item.value);
      }
      this.formGroup.reset();
      this.createMode = false;
      this.editMode = false;
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
    return this.formGroup.get('item');
  }
}
