import { Component, inject } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'filter-header',
  templateUrl: './filter-header.component.html',
  styleUrls: ['./filter-header.component.css'],
  imports: [MatIconModule],
})
export class FilterHeaderComponent {
  readonly sharedService = inject(SharedService);
}
