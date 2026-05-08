import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToggleComponent } from '../toggle/toggle.component';
import { slideDownUp } from './animations';
import { DropdownOption } from './models';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  imports: [CommonModule, MatIconModule, ToggleComponent],
  animations: [slideDownUp],
})
export class DropdownComponent {
  readonly sharedService = inject(SharedService);
  private readonly router = inject(Router);

  @Input() showOptions = false;
  @Input() title: string;
  @Input() selectedTab: string;
  @Input() options: DropdownOption[];
  @Input() path: string;
  @Output() onNavigation = new EventEmitter<string>();

  select(path: string): void {
    if (this.selectedTab != path) {
      this.onNavigation.emit(path);
    }
    this.router.navigate([this.path]);
  }
}
