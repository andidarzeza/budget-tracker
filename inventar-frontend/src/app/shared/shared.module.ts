import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm/confirm.component';
import { FormsModule } from '@angular/forms';
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
import { AddSpendingComponent } from '../components/expenses/add-spending/add-spending.component';
import { RecordActionsComponent } from './record-actions/record-actions.component';
import { CustomDatePipe } from '../pipes/custom-date.pipe';



@NgModule({
  declarations: [ConfirmComponent, NotFoundComponent, FloatingMenuComponent, AbsoluteValuePipe, CustomDatePipe, TableActionsComponent, RecordActionsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ConfirmComponent,
    FloatingMenuComponent,
    AbsoluteValuePipe,
    CustomDatePipe,
    TableActionsComponent,
    RecordActionsComponent
  ],
  providers: [
    DialogService
  ],
  entryComponents: [
    AddSpendingComponent
  ]
})
export class SharedModule { }
