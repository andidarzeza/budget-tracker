import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateFormModule } from 'src/app/shared/create-form/create-form.module';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { SelectInputComponent } from 'src/app/shared/select-input/select-input.component';
import { SelectIconModule } from 'src/app/shared/select-icon/select-icon.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FlagPipeModule } from 'src/app/template/pipes/flag-pipe/flag-pipe.module';
import { AddContributionComponent } from './add-contribution/add-contribution.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    AddProjectComponent,
    AddContributionComponent,
    ProjectDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProjectsRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CreateFormModule,
    SelectIconModule,
    FlagPipeModule,
    SharedModule,
    LabeledFormInputComponent,
    SelectInputComponent
  ]
})
export class ProjectsModule { }
