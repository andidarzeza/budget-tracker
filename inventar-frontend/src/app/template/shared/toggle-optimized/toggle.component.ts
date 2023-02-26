import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: ToggleComponent
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent implements ControlValueAccessor{
  value!: boolean;

  @Output() onValueChange = new EventEmitter();

  constructor() { }

  onChange!: (value: boolean) => void;
  onTouched!: () => void;

  writeValue(value: boolean): void {
    this.value = value;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggle(): void {    
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }

}
