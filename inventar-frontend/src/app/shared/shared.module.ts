import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm/confirm.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NotFoundComponent } from './not-found/not-found.component';
import { FloatingMenuComponent } from './floating-menu/floating-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbsoluteValuePipe } from '../pipes/absolute-value.pipe';
import { TableActionsComponent } from './table-actions/table-actions.component';
import { DialogService } from '../services/dialog.service';
import { AddExpenseComponent } from '../components/expenses/add-expense/add-expense.component';
import { RecordActionsComponent } from './record-actions/record-actions.component';
import { CustomDatePipe } from '../pipes/custom-date.pipe';
import { IconSelectComponent } from './icon-select/icon-select.component';
import { MatInputModule } from '@angular/material/input';
import { FilterModule } from './table-actions/filter/filter.module';
import { TableMessageModule } from './table-message/table-message.module';
import { ConfirmModule } from './confirm/confirm.module';



@NgModule({
  declarations: [IconSelectComponent, NotFoundComponent, FloatingMenuComponent, AbsoluteValuePipe, CustomDatePipe, TableActionsComponent, RecordActionsComponent],
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
    RecordActionsComponent,
    IconSelectComponent
  ],
  providers: [DialogService],
  entryComponents: [AddExpenseComponent]
})
export class SharedModule { }
