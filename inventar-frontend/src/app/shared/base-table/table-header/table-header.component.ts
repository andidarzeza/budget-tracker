import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinition } from 'src/app/models/models';
import { ColumnWidthPipe } from '../column-width/column-width.pipe';

@Component({
  selector: 'table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css'],
  imports: [CommonModule, ColumnWidthPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderComponent {
  readonly breakpointService = inject(BreakpointService);

  @Input() columnDefinitions: ColumnDefinition[];

  /** Row actions live in the context menu / keyboard, not in a column. */
  get visibleColumns(): ColumnDefinition[] {
    return (this.columnDefinitions || []).filter((c) => c.type !== 'actions');
  }
}
