import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { FilterOptions } from './filter.models';

/**
 * Collapsible filter panel rendered below a table's toolbar.
 *
 * UX rules baked in:
 * - Closing (X) preserves whatever's currently applied — only the panel
 *   disappears.
 * - Reset wipes both the form *and* the applied filters in a single click.
 * - Apply does not auto-close the panel, so users can iterate (tweak
 *   description, re-apply, etc.) without re-opening every time.
 * - `appliedCount` is exposed so the toolbar can render an "n active" badge.
 */
@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    LabeledFormInputComponent,
    SelectInputComponent,
  ],
  animations: [
    trigger('panelIn', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('180ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [animate('140ms ease-in', style({ height: 0, opacity: 0 }))]),
    ]),
  ],
})
export class FilterComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  @Input() filterOptions: FilterOptions[] = [];
  /**
   * Last-applied form values, supplied by the parent. The filter is mounted
   * via `@if`, so closing and reopening the panel destroys the component
   * and loses any form state. Hydrating from the parent restores it.
   */
  @Input() initialValues: Record<string, unknown> = {};

  @Output() applied = new EventEmitter<{
    params: HttpParams;
    count: number;
    values: Record<string, unknown>;
  }>();
  @Output() reset = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly formGroup: FormGroup = this.formBuilder.group({});

  /** Number of fields currently committed to the table query. */
  readonly appliedCount = signal(0);
  /** True when the form differs from the applied state — drives Apply enablement. */
  readonly dirty = signal(false);
  readonly hasFormValues = computed(() => this.dirty() || this.appliedCount() > 0);

  /** Snapshot of the last-applied form values, used to detect dirtiness. */
  private appliedSnapshot: Record<string, unknown> = {};

  ngOnInit(): void {
    for (const option of this.filterOptions ?? []) {
      const seed = this.initialValues?.[option.field] ?? null;
      this.formGroup.addControl(option.field, new FormControl<unknown>(seed));
    }
    // Re-create the snapshot from the parent-provided values so the
    // `dirty` flag and `appliedCount` are accurate immediately on mount.
    this.appliedSnapshot = { ...(this.initialValues ?? {}) };
    this.appliedCount.set(Object.keys(this.appliedSnapshot).length);
    this.formGroup.valueChanges.subscribe(() => this.recomputeDirty());
  }

  onEnter(): void {
    this.apply();
  }

  apply(): void {
    let params = new HttpParams();
    let count = 0;
    const snapshot: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(this.formGroup.value)) {
      // Treat empty strings, null, and undefined as "not applied" so users
      // can clear an individual field by deleting its text.
      if (raw === '' || raw == null) continue;
      params = params.append(key, String(raw));
      snapshot[key] = raw;
      count++;
    }
    this.appliedSnapshot = snapshot;
    this.appliedCount.set(count);
    this.dirty.set(false);
    this.applied.emit({ params, count, values: snapshot });
  }

  clear(): void {
    this.formGroup.reset();
    this.appliedSnapshot = {};
    this.appliedCount.set(0);
    this.dirty.set(false);
    this.reset.emit();
  }

  close(): void {
    this.closed.emit();
  }

  /** `cb-select-input` callback — read `option[displayBy]` from the legacy config. */
  displayBy(filterOption: FilterOptions): (opt: any) => string {
    const key = filterOption?.matSelectOptions?.displayBy;
    return (opt: any) => (opt && key ? String(opt[key]) : '');
  }

  /** `cb-select-input` callback — read `option[valueBy]` from the legacy config. */
  valueBy(filterOption: FilterOptions): (opt: any) => unknown {
    const key = filterOption?.matSelectOptions?.valueBy;
    return (opt: any) => (opt && key ? opt[key] : opt);
  }

  private recomputeDirty(): void {
    const current = this.formGroup.value as Record<string, unknown>;
    // Compare normalized maps (empty/null treated identically) so toggling a
    // field between '' and null doesn't flag dirty.
    const norm = (v: unknown) => (v === '' || v == null ? null : v);
    const keys = new Set([...Object.keys(current), ...Object.keys(this.appliedSnapshot)]);
    for (const k of keys) {
      if (norm(current[k]) !== norm(this.appliedSnapshot[k])) {
        this.dirty.set(true);
        return;
      }
    }
    this.dirty.set(false);
  }
}
