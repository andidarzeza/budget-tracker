import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColumnDefinition } from 'src/app/models/models';

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHeaderComponent {

  constructor() { }

  @Input() displayDrawer: boolean;
  @Input() columnDefinitions: ColumnDefinition[];



}
