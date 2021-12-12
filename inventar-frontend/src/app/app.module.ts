import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookTableComponent } from './components/book-table/book-table.component';
import {MatTableModule} from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { AssociateTableComponent } from './components/associate-table/associate-table.component';
import { AddAssociateComponent } from './components/add-associate/add-associate.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddBookComponent } from './components/add-book/add-book.component';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { AssociateInfoComponent } from './components/associate-info/associate-info.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { DataPipe } from './pipes/data.pipe';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { CilesimetComponent } from './components/cilesimet/cilesimet.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { StatisticsComponent } from './components/statistics/statistics.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { IconSelectComponent } from './components/custom/icon-select/icon-select.component';

@NgModule({
  declarations: [
    AppComponent,
    BookTableComponent,
    NavBarComponent,
    AssociateTableComponent,
    AddAssociateComponent,
    AddBookComponent,
    ConfirmComponent,
    AssociateInfoComponent,
    DataPipe,
    SideBarComponent,
    CilesimetComponent,
    StatisticsComponent,
    DashboardComponent,
    CategoriesComponent,
    AddCategoryComponent,
    IconSelectComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTableModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
