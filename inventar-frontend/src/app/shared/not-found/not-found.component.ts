import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PillButtonComponent } from '../pill-button/pill-button.component';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  imports: [ PillButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly route = inject(Router);

  navigate(page: string) {
    this.route.navigate([`/${page}`]);
  }
}
