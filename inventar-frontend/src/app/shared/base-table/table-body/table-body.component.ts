import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inOutAnimation } from 'src/app/animations';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinition } from 'src/app/models/models';
import { CustomDatePipe } from 'src/app/pipes/custom-date.pipe';
import { ColumnWidthPipe } from '../column-width/column-width.pipe';
import { RecordActionsComponent } from '../../record-actions/record-actions.component';

@Component({
  selector: 'table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.css'],
  imports: [
    CommonModule,
    ScrollingModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatTooltipModule,
    ColumnWidthPipe,
    CustomDatePipe,
    RecordActionsComponent,
  ],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBodyComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly breakpointService = inject(BreakpointService);

  @Input() columnDefinitions: ColumnDefinition[];
  @Input() data: any[];
  @Input() displayEditAction: boolean;
  @Input() displayDeleteAction: boolean;
  @Input() displayViewAction = true;
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

  ngAfterViewInit(): void {
    this.scheduleObserveSetup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['infiniteScrollEnabled'] || changes['hasMore'] || changes['data'] || changes['loadingMore']) {
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

  /**
   * Mobile card layout: skip the description field entirely when it's empty
   * — it would otherwise render as a label with a `—` placeholder, which is noise.
   * Used for expense, income and category cards (only those define a `description` column).
   */
  shouldHideField(element: any, columnDef: ColumnDefinition): boolean {
    if (columnDef?.column !== 'description') {
      return false;
    }
    const v = element?.description;
    return v == null || String(v).trim() === '';
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
