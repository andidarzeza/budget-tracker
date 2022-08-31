import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NotFoundComponent } from './not-found/not-found.component';
import { FloatingMenuComponent } from './floating-menu/floating-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbsoluteValuePipe } from '../pipes/absolute-value.pipe';
import { TableActionsComponent } from './base-table/table-actions/table-actions.component';
import { DialogService } from '../services/dialog.service';
import { AddExpenseComponent } from '../components/expenses/add-expense/add-expense.component';
import { RecordActionsComponent } from './record-actions/record-actions.component';
import { CustomDatePipe } from '../pipes/custom-date.pipe';
import { MatInputModule } from '@angular/material/input';
import { FilterModule } from './base-table/table-actions/filter/filter.module';
import { TableMessageModule } from './table-message/table-message.module';
import { ConfirmModule } from './confirm/confirm.module';
import { TableActionsModule } from './base-table/table-actions/table-actions.module';



@NgModule({
  declarations: [NotFoundComponent, FloatingMenuComponent, AbsoluteValuePipe, CustomDatePipe, RecordActionsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    TableMessageModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatInputModule,
    TableActionsModule,
    ConfirmModule,
    FilterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    TableMessageModule,
    FloatingMenuComponent,
    AbsoluteValuePipe,
    CustomDatePipe,
    TableActionsComponent,
    RecordActionsComponent
  ],
  providers: [DialogService],
  entryComponents: [AddExpenseComponent]
})
export class SharedModule { }
