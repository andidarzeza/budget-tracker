import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClockModule } from './clock/clock.module';
import { FlagPipeModule } from '../../pipes/flag-pipe/flag-pipe.module';
import { CurrencySymbolModule } from '../../pipes/currency-symbol/currency-symbol.module';



@NgModule({
  declarations: [NavBarComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    ClockModule,
    MatDividerModule,
    FlagPipeModule,
    CurrencySymbolModule
  ], exports: [NavBarComponent]
})
export class NavBarModule { }
