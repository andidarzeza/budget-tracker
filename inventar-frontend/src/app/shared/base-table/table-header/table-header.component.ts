import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinition } from 'src/app/models/models';

@Component({ standalone: false,
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHeaderComponent {

  constructor(public breakpointService: BreakpointService) { }

  @Input() columnDefinitions: ColumnDefinition[];



}
