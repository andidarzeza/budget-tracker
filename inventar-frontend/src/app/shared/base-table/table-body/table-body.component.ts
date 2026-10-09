import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
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
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inOutAnimation } from 'src/app/animations';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ColumnDefinition } from 'src/app/models/models';
import { CustomDatePipe } from 'src/app/pipes/custom-date.pipe';
import { ColumnWidthPipe } from '../column-width/column-width.pipe';
import { iosTileColorForName } from '../../ios/ios-colors';
import { RecordActionsComponent } from '../../record-actions/record-actions.component';
import { TOOLTIP_IMPORTS } from '../../tooltip-mobile-guard/tooltip-imports';

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
    ...TOOLTIP_IMPORTS,
  ],
  animations: [inOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBodyComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly breakpointService = inject(BreakpointService);
  private readonly cdr = inject(ChangeDetectorRef);

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
  @ViewChild('contextTrigger') contextTrigger?: MatMenuTrigger;

  /** Where the right-click menu opens, and the row it acts on. */
  menuX = 0;
  menuY = 0;
  menuElement: any = null;

  selectedId: string | null = null;

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

  /** Row actions live in the context menu / keyboard, not in a column. */
  get visibleColumns(): ColumnDefinition[] {
    return (this.columnDefinitions || []).filter((c) => c.type !== 'actions');
  }

  /** Click selects; a single click on the selected row deselects it. */
  select(element: any, event?: MouseEvent): void {
    const id = element?.id;
    if (event && event.detail === 1 && this.selectedId === id) {
      this.selectedId = null;
      return;
    }
    this.selectedId = id;
  }

  /** Clicking anywhere outside the rows (or pressing Esc) clears the selection. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.selectedId) return;
    const target = event.target as Element | null;
    if (!target?.closest('.data-row') && !target?.closest('.row-context-menu')) {
      this.selectedId = null;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedId) {
      this.selectedId = null;
      this.cdr.markForCheck();
    }
  }

  /** Double-click / Return: edit when editing is allowed, otherwise view. */
  openPrimary(element: any): void {
    this.select(element);
    if (this.displayEditAction) this.openAddEditForm(element);
    else if (this.displayViewAction) this.viewDetails(element?.id);
  }

  openContextMenu(event: MouseEvent, element: any): void {
    if (!this.displayEditAction && !this.displayViewAction && !this.displayDeleteAction) return;
    event.preventDefault();
    this.select(element);
    this.menuElement = element;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    // Let the trigger move to the pointer before the menu measures it.
    setTimeout(() => this.contextTrigger?.openMenu());
  }

  onRowKeydown(event: KeyboardEvent, element: any): void {
    const row = event.currentTarget as HTMLElement;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.openPrimary(element);
        break;
      case 'Delete':
      case 'Backspace':
        if (this.displayDeleteAction) {
          event.preventDefault();
          this.openDeleteConfirmDialog(element?.id);
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const next = (event.key === 'ArrowDown' ? row.nextElementSibling : row.previousElementSibling) as HTMLElement | null;
        if (next?.classList.contains('data-row')) {
          next.focus();
          next.click();
        }
        break;
      }
    }
  }

  /** Solid iOS tile colour for a row's icon, keyed by its category name. */
  iconTileColor(element: any): string {
    return iosTileColorForName(element?.category);
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
