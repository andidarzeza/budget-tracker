import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { Contribution, ProjectView } from 'src/app/models/models';
import { CustomDatePipe } from 'src/app/pipes/custom-date.pipe';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { FlagPipe } from 'src/app/template/pipes/flag-pipe/flag.pipe';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddContributionComponent } from '../add-contribution/add-contribution.component';
import { AddProjectComponent } from '../add-project/add-project.component';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, FlagPipe, CustomDatePipe],
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(DialogService);
  private readonly toaster = inject(ToastrService);
  private readonly sideBarService = inject(SideBarService);
  private readonly navBarService = inject(NavBarService);
  private readonly routeSpinnerService = inject(RouteSpinnerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly view = signal<ProjectView | null>(null);
  readonly contributions = signal<Contribution[] | null>(null);

  /** {saved, pct} progress in the project's target currency. */
  readonly progress = computed(() => {
    const v = this.view();
    if (!v) return { saved: 0, target: 0, pct: 0 };
    const target = v.project.targetAmount || 0;
    const cur = (v.project.targetCurrency || '').toUpperCase();
    const saved =
      (v.totalsByCurrency || []).find((t) => (t._id || '').toUpperCase() === cur)?.total ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { saved, target, pct };
  });

  /** Currencies other than target — surfaced separately since they aren't directly comparable. */
  readonly otherTotals = computed(() => {
    const v = this.view();
    if (!v) return [];
    const cur = (v.project.targetCurrency || '').toUpperCase();
    return (v.totalsByCurrency || []).filter((t) => (t._id || '').toUpperCase() !== cur);
  });

  private projectId!: string;

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.projectId = String(this.route.snapshot.paramMap.get('id'));
    this.refresh();
  }

  refresh(): void {
    this.projectService
      .findOne(this.projectId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.toaster.error('Could not load project.', 'Server Error', TOASTER_CONFIGURATION);
          this.router.navigate(['/projects']);
          return of(null);
        }),
      )
      .subscribe((view) => this.view.set(view));

    this.projectService
      .contributions(this.projectId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([] as Contribution[])),
      )
      .subscribe((rows) => this.contributions.set(rows));
  }

  back(): void {
    this.router.navigate(['/projects']);
  }

  openAddContribution(): void {
    const view = this.view();
    this.dialog
      .openDialog(AddContributionComponent, {
        projectId: this.projectId,
        defaultCurrency: view?.project.targetCurrency,
      })
      .onSuccess(() => this.refresh());
  }

  openEdit(): void {
    const v = this.view();
    if (!v) return;
    this.dialog.openDialog(AddProjectComponent, v.project).onSuccess(() => this.refresh());
  }

  deleteContribution(contribution: Contribution): void {
    if (!contribution.id) return;
    this.dialog.openConfirmDialog().onSuccess(() => {
      this.projectService
        .deleteContribution(contribution.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toaster.success('Contribution removed', 'Success', TOASTER_CONFIGURATION);
            this.refresh();
          },
          error: () =>
            this.toaster.error(
              'Could not remove contribution.',
              'Server Error',
              TOASTER_CONFIGURATION,
            ),
        });
    });
  }

  deleteProject(): void {
    const v = this.view();
    if (!v?.project.id) return;
    this.dialog.openConfirmDialog().onSuccess(() => {
      this.projectService
        .delete(v.project.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toaster.success('Project deleted', 'Success', TOASTER_CONFIGURATION);
            this.router.navigate(['/projects']);
          },
          error: () =>
            this.toaster.error(
              'Could not delete project.',
              'Server Error',
              TOASTER_CONFIGURATION,
            ),
        });
    });
  }

  trackById = (_: number, c: Contribution) => c.id;
}
