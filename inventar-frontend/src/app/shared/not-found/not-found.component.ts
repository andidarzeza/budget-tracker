import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  imports: [MatButtonModule],
})
export class NotFoundComponent {
  private readonly route = inject(Router);
  readonly sharedService = inject(SharedService);

  navigate(page: string) {
    this.route.navigate([`/${page}`]);
  }
}
