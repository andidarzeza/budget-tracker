import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatTableModule} from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmComponent } from './components/confirm/confirm.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { DataPipe } from './pipes/data.pipe';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { CilesimetComponent } from './components/cilesimet/cilesimet.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { IconSelectComponent } from './components/custom/icon-select/icon-select.component';
import { BudgetInfoComponent } from './components/budget-info/budget-info.component';
import { SpendingsComponent } from './components/spendings/spendings.component';
import { AddSpendingComponent } from './components/add-spending/add-spending.component';
import {MatSelectModule} from '@angular/material/select';
import { IncomingsComponent } from './components/incomings/incomings.component';
import { AddIncomingComponent } from './components/add-incoming/add-incoming.component';
import { DatePickerComponent } from './components/custom/date-picker/date-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ConfirmComponent,
    DataPipe,
    SideBarComponent,
    CilesimetComponent,
    DashboardComponent,
    CategoriesComponent,
    AddCategoryComponent,
    IconSelectComponent,
    BudgetInfoComponent,
    SpendingsComponent,
    AddSpendingComponent,
    IncomingsComponent,
    AddIncomingComponent,
    DatePickerComponent,
    
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
    MatSelectModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
