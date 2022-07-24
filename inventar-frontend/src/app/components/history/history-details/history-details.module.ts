import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryDetailsComponent } from './history-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [HistoryDetailsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [HistoryDetailsComponent]
})
export class HistoryDetailsModule { }
