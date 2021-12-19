import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { NavBarComponent } from './template/nav-bar/nav-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataPipe } from './pipes/data.pipe';
import { SideBarComponent } from './template/side-bar/side-bar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AddSpendingComponent } from './components/expenses/add-spending/add-spending.component';
import { MatSelectModule } from '@angular/material/select';
import { CategoriesModule } from './components/categories/categories.module';
import { SettingsModule } from './components/settings/settings.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { IncomesModule } from './components/incomes/incomes.module';
import { ExpensesModule } from './components/expenses/expenses.module';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ConfirmComponent,
    DataPipe,
    SideBarComponent,
    AddSpendingComponent
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
    CategoriesModule,
    SettingsModule,
    DashboardModule,
    IncomesModule,
    ExpensesModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
