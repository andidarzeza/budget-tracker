import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'filter-actions',
  templateUrl: './filter-actions.component.html',
  styleUrls: ['./filter-actions.component.css'],
  imports: [MatButtonModule, MatIconModule],
})
export class FilterActionsComponent {
  readonly sharedService = inject(SharedService);

  @Output() onReset = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<void>();

  reset(): void {
    this.onReset.emit();
  }

  search(): void {
    this.onSearch.emit();
  }
}
