import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Project, ProjectView } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { ProjectService } from 'src/app/services/pages/project.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AddProjectComponent } from './add-project/add-project.component';

@Component({
  standalone: false,
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent extends Unsubscribe implements OnInit {

  readonly projects = signal<ProjectView[] | null>(null);

  constructor(
    private projectService: ProjectService,
    private accountService: AccountService,
    private dialog: DialogService,
    private toaster: ToastrService,
    private router: Router,
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
    this.refresh();
  }

  refresh(): void {
    this.projectService.list(this.accountService.getAccount())
      .pipe(takeUntil(this.unsubscribe$), catchError(() => {
        this.toaster.error('Could not load projects.', 'Server Error', TOASTER_CONFIGURATION);
        return of([] as ProjectView[]);
      }))
      .subscribe(rows => this.projects.set(rows));
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
    const saved = (view.totalsByCurrency || [])
      .find(t => (t._id || '').toUpperCase() === (view.project.targetCurrency || '').toUpperCase())
      ?.total ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return { saved, pct };
  }

  /** Currencies other than the target — shown as "additional savings" on each card. */
  otherTotals(view: ProjectView) {
    const target = (view.project.targetCurrency || '').toUpperCase();
    return (view.totalsByCurrency || []).filter(t => (t._id || '').toUpperCase() !== target);
  }

  trackById = (_: number, view: ProjectView) => view.project.id;
}
