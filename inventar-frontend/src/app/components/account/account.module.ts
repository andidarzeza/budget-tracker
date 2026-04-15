import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { AccountRoutingModule } from './account-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MatButtonModule,
    MatRippleModule,
    MatProgressBarModule,
    MatCardModule
  ],
  exports: [AccountComponent]
})
export class AccountModule { }
