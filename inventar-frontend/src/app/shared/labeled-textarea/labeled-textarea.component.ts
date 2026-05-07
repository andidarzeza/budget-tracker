import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cb-labeled-textarea',
  imports: [ReactiveFormsModule],
  templateUrl: './labeled-textarea.component.html',
  styleUrl: './labeled-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledTextareaComponent {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input<string>('Label');
  readonly placeholder = input<string>('');
  readonly inputId = input<string>('labeled-textarea');
  readonly rows = input<number>(4);
}

