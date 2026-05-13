import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { ProjectView } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { IconButtonComponent } from 'src/app/shared/icon-button/icon-button.component';
import { PillButtonComponent } from 'src/app/shared/pill-button/pill-button.component';
import { TOOLTIP_IMPORTS } from 'src/app/shared/tooltip-mobile-guard/tooltip-imports';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddProjectComponent } from './add-project/add-project.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    PillButtonComponent,
    IconButtonComponent,
    ...TOOLTIP_IMPORTS,
  ],
})
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly accountService = inject(AccountService);
  private readonly dialog = inject(DialogService);
  private readonly toaster = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = signal<ProjectView[] | null>(null);

  /** Same breakpoint as table-card layout (≤767px) — switches the page from
   *  the desktop card grid to the mobile ledger view. */
  readonly isMobile = toSignal(this.breakpointService.useTableCardLayout$, { initialValue: false });

  /** Top summary card — total projects + how many are complete (≥100%). */
  readonly summary = computed(() => {
    const rows = this.projects() ?? [];
    const completed = rows.filter((v) => this.primaryProgress(v).pct >= 100).length;
    return { total: rows.length, completed };
  });

  /** Two buckets so the mobile list mirrors the expenses/incomes/categories
   *  grouped look. Empty buckets are dropped — no "Completed" header until
   *  the user actually has one. */
  readonly groupedRows = computed(() => {
    const rows = this.projects() ?? [];
    const active = rows.filter((v) => this.primaryProgress(v).pct < 100);
    const done = rows.filter((v) => this.primaryProgress(v).pct >= 100);
    const groups: { key: string; label: string; items: ProjectView[] }[] = [];
    if (active.length > 0) groups.push({ key: 'ACTIVE', label: 'IN PROGRESS', items: active });
    if (done.length > 0) groups.push({ key: 'COMPLETE', label: 'COMPLETED', items: done });
    return groups;
  });

  iconBg(name: string | null | undefined): string {
    return `color-mix(in srgb, hsl(${this.hueFor(name ?? '')}, 65%, 55%) 18%, transparent)`;
  }

  iconFg(name: string | null | undefined): string {
    return `hsl(${this.hueFor(name ?? '')}, 55%, 45%)`;
  }

  private hueFor(name: string): number {
    if (!name) return 215;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    const palette = [32, 215, 340, 270, 145, 8, 195];
    return palette[Math.abs(hash) % palette.length];
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.refresh();
  }

  refresh(): void {
    this.projectService
      .list(this.accountService.getAccount())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.toaster.error('Could not load projects.', 'Server Error', TOASTER_CONFIGURATION);
          return of([] as ProjectView[]);
        }),
      )
      .subscribe((rows) => this.projects.set(rows));
  }

  open(view: ProjectView): void {
    if (!view.project.id) return;
    this.router.navigate(['/projects', view.project.id]);
  }

  openAddDialog(): void {
    this.dialog.openDialog(AddProjectComponent).onSuccess(() => this.refresh());
  }

  /**
   * Progress in the project's target currency only — cross-currency conversion isn't
   * available, so other currencies are surfaced as a separate "additional" line.
   */
  primaryProgress(view: ProjectView): { saved: number; pct: number } {
    const target = view.project.targetAmount || 0;
    const saved =
      (view.totalsByCurrency || []).find(
        (t) => (t._id || '').toUpperCase() === (view.project.targetCurrency || '').toUpperCase(),
      )?.total ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { saved, pct };
  }

  /** Currencies other than the target — shown as "additional savings" on each card. */
  otherTotals(view: ProjectView) {
    const target = (view.project.targetCurrency || '').toUpperCase();
    return (view.totalsByCurrency || []).filter((t) => (t._id || '').toUpperCase() !== target);
  }

  trackById = (_: number, view: ProjectView) => view.project.id;
}
