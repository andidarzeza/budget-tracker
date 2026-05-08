import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedService } from 'src/app/services/shared.service';
import { FloatingMenuConfig } from './FloatingMenuConfig';

@Component({
  selector: 'floating-menu',
  templateUrl: './floating-menu.component.html',
  styleUrls: ['./floating-menu.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
})
export class FloatingMenuComponent {
  readonly sharedService = inject(SharedService);

  @Input() floatingMenu: FloatingMenuConfig;

  executeAction(action: Function): void {
    action.call(this);
  }
}
