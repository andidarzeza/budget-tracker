import { Routes } from '@angular/router';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectsComponent } from './projects.component';

export const PROJECTS_ROUTES: Routes = [
  { path: '', component: ProjectsComponent },
  { path: ':id', component: ProjectDetailComponent },
];
