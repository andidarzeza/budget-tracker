import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Contribution, ProjectView } from 'src/app/models/models';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddContributionComponent } from '../add-contribution/add-contribution.component';
import { AddProjectComponent } from '../add-project/add-project.component';

@Component({
  standalone: false,
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailComponent extends Unsubscribe implements OnInit {

  readonly view = signal<ProjectView | null>(null);
  readonly contributions = signal<Contribution[] | null>(null);

  /** {saved, pct} progress in the project's target currency. */
  readonly progress = computed(() => {
    const v = this.view();
    if (!v) return { saved: 0, target: 0, pct: 0 };
    const target = v.project.targetAmount || 0;
    const cur = (v.project.targetCurrency || '').toUpperCase();
    const saved = (v.totalsByCurrency || [])
      .find(t => (t._id || '').toUpperCase() === cur)?.total ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { saved, target, pct };
  });

  /** Currencies other than target — surfaced separately since they aren't directly comparable. */
  readonly otherTotals = computed(() => {
    const v = this.view();
    if (!v) return [];
    const cur = (v.project.targetCurrency || '').toUpperCase();
    return (v.totalsByCurrency || []).filter(t => (t._id || '').toUpperCase() !== cur);
  });

  private projectId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: DialogService,
    private toaster: ToastrService,
    private sideBarService: SideBarService,
    private navBarService: NavBarService,
    private routeSpinnerService: RouteSpinnerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.routeSpinnerService.stopLoading();
    this.sideBarService.displaySidebar = true;
    this.navBarService.displayNavBar = true;
    this.projectId = String(this.route.snapshot.paramMap.get('id'));
    this.refresh();
  }

  refresh(): void {
    this.projectService.findOne(this.projectId)
      .pipe(takeUntil(this.unsubscribe$), catchError(() => {
        this.toaster.error('Could not load project.', 'Server Error', TOASTER_CONFIGURATION);
        this.router.navigate(['/projects']);
        return of(null);
      }))
      .subscribe(view => this.view.set(view));

    this.projectService.contributions(this.projectId)
      .pipe(takeUntil(this.unsubscribe$), catchError(() => of([] as Contribution[])))
      .subscribe(rows => this.contributions.set(rows));
  }

  back(): void {
    this.router.navigate(['/projects']);
  }

  openAddContribution(): void {
    const view = this.view();
    this.dialog.openDialog(AddContributionComponent, {
      projectId: this.projectId,
      defaultCurrency: view?.project.targetCurrency
    }).onSuccess(() => this.refresh());
  }

  openEdit(): void {
    const v = this.view();
    if (!v) return;
    this.dialog.openDialog(AddProjectComponent, v.project).onSuccess(() => this.refresh());
  }

  deleteContribution(contribution: Contribution): void {
    if (!contribution.id) return;
    this.dialog.openConfirmDialog().onSuccess(() => {
      this.projectService.deleteContribution(contribution.id!)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.toaster.success('Contribution removed', 'Success', TOASTER_CONFIGURATION);
            this.refresh();
          },
          error: () => this.toaster.error('Could not remove contribution.', 'Server Error', TOASTER_CONFIGURATION)
        });
    });
  }

  deleteProject(): void {
    const v = this.view();
    if (!v?.project.id) return;
    this.dialog.openConfirmDialog().onSuccess(() => {
      this.projectService.delete(v.project.id!)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.toaster.success('Project deleted', 'Success', TOASTER_CONFIGURATION);
            this.router.navigate(['/projects']);
          },
          error: () => this.toaster.error('Could not delete project.', 'Server Error', TOASTER_CONFIGURATION)
        });
    });
  }

  trackById = (_: number, c: Contribution) => c.id;
}
