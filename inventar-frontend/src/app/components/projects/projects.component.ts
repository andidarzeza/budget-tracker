import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { ProjectView } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddProjectComponent } from './add-project/add-project.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
})
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly accountService = inject(AccountService);
  private readonly dialog = inject(DialogService);
  private readonly toaster = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly projects = signal<ProjectView[] | null>(null);

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
