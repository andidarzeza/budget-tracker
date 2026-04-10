import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { inOutAnimation } from 'src/app/animations';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinition } from 'src/app/models/models';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css'],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBodyComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  /** When true, loads more rows when the sentinel nears the viewport (mobile cards). */
  @Input() infiniteScrollEnabled = false;
  @Input() hasMore = false;
  @Input() loadingMore = false;

  @Output() onDeleteConfirmation = new EventEmitter();
  @Output() onAddEditForm = new EventEmitter();
  @Output() onViewDetails = new EventEmitter();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('loadSentinel', { static: false }) loadSentinel: ElementRef<HTMLElement>;

  selectedId: string;

  private intersectionObserver: IntersectionObserver | null = null;
  private observeTimer: any;

  constructor(public breakpointService: BreakpointService) { }

  ngAfterViewInit(): void {
    this.scheduleObserveSetup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.infiniteScrollEnabled || changes.hasMore || changes.data || changes.loadingMore) {
      this.scheduleObserveSetup();
    }
  }

  ngOnDestroy(): void {
    this.teardownObserver();
    if (this.observeTimer) {
      clearTimeout(this.observeTimer);
    }
  }

  private scheduleObserveSetup(): void {
    if (this.observeTimer) {
      clearTimeout(this.observeTimer);
    }
    this.observeTimer = setTimeout(() => {
      this.observeTimer = null;
      this.setupIntersectionObserver();
    }, 0);
  }

  private teardownObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  private setupIntersectionObserver(): void {
    this.teardownObserver();
    if (!this.infiniteScrollEnabled || !this.hasMore || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const el = this.loadSentinel?.nativeElement;
    if (!el) {
      return;
    }
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.loadingMore) {
            this.loadMore.emit();
          }
        }
      },
      { root: null, rootMargin: '80px', threshold: 0 }
    );
    this.intersectionObserver.observe(el);
  }

  /** Mobile cards: amount first, then other fields; date columns render at the bottom of the card. */
  get cardMainFieldColumns(): ColumnDefinition[] {
    const data = (this.columnDefinitions || []).filter((c) => c.type !== 'actions' && c.type !== 'date');
    const money = data.filter((c) => c.type === 'currency');
    const rest = data.filter((c) => c.type !== 'currency');
    return [...money, ...rest];
  }

  get cardDateColumns(): ColumnDefinition[] {
    return (this.columnDefinitions || []).filter((c) => c.type === 'date');
  }

  displayString(element: any, column: string): string {
    if (!element) {
      return '—';
    }
    const v = element[column];
    if (v == null || v === '') {
      return '—';
    }
    if (typeof v === 'object') {
      if (v?.category != null) {
        return String(v.category);
      }
      if (v?.name != null) {
        return String(v.name);
      }
      return '—';
    }
    return String(v);
  }

  openDeleteConfirmDialog(id: string): void {
    this.onDeleteConfirmation.emit(id);
  }

  openAddEditForm(element: any): void {
    this.onAddEditForm.emit(element);
  }

  viewDetails(id: string): void {
    this.selectedId = id;
    this.onViewDetails.emit(id);
  }

}
