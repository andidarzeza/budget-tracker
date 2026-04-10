import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ColumnDefinition } from 'src/app/models/models';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { SharedService } from 'src/app/services/shared.service';
import { FilterOptions } from './table-actions/filter/filter.models';
import { TableActionInput } from './table-actions/TableActionInput';
import { PAGE_SIZE } from 'src/environments/environment';

@Component({
  selector: 'base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseTableComponent implements OnInit, OnDestroy {

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

  /** Current page index for server-side mat-paginator (0-based). */
  @Input() pageIndex = 0;
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

  constructor(
    public sharedService: SharedService,
    public breakpointService: BreakpointService
  ) { }

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
