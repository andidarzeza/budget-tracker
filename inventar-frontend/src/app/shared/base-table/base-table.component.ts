import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ColumnDefinition } from 'src/app/models/models';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { SharedService } from 'src/app/services/shared.service';
import { TableActionsComponent } from './table-actions/table-actions.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableBodyComponent } from './table-body/table-body.component';
import { TableMessageComponent } from '../table-message/table-message.component';
import { FilterOptions } from './table-actions/filter/filter.models';
import { TableActionInput } from './table-actions/TableActionInput';
import { PAGE_SIZE } from 'src/environments/environment';

@Component({
  selector: 'base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TableActionsComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('400ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class BaseTableComponent implements OnInit, OnDestroy {
  readonly sharedService = inject(SharedService);
  readonly breakpointService = inject(BreakpointService);

  @Input() data: any[];
  @Input() total: number;
  @Input() columnDefinition: ColumnDefinition[];
  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();

  @Input() tableActionInput: TableActionInput;
  @Input() filterOptions: FilterOptions[];
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  @Input() displayViewAction = true;

  /** Current page index for server-side mat-paginator (0-based). */
  @Input() pageIndex = 0;
  @Input() loading = false;
  @Input() loadingMore = false;

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onOpenDialog: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onReset: EventEmitter<any> = new EventEmitter();
  @Output() nextPage: EventEmitter<number> = new EventEmitter();
  @Output() loadMore = new EventEmitter<void>();
  /** Emitted when switching between mobile cards and desktop table so the host can reset paging / list. */
  @Output() layoutModeChange = new EventEmitter<void>();

  readonly pageSize = PAGE_SIZE;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    let prevMobile: boolean | undefined;
    this.breakpointService.useTableCardLayout$
      .pipe(
        map((m) => m === true),
        takeUntil(this.destroy$)
      )
      .subscribe((mobile) => {
        if (prevMobile !== undefined && prevMobile !== mobile) {
          this.layoutModeChange.emit();
        }
        prevMobile = mobile;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasMoreData(): boolean {
    const len = this.data?.length ?? 0;
    const t = this.total ?? 0;
    return t > 0 && len < t;
  }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.onViewDetails.emit(id);
  }

  handlePageEvent(event: { pageIndex: number }): void {
    this.nextPage.emit(event.pageIndex);
  }

  emitLoadMore(): void {
    this.loadMore.emit();
  }
}
