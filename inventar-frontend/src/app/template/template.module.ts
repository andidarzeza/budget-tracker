import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from '../app-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [NavBarComponent, SideBarComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    AppRoutingModule,
    MatToolbarModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  exports: [NavBarComponent, SideBarComponent]
})
export class TemplateModule { }
