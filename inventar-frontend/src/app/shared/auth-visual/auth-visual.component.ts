import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Marketing preview shown in the left "visual panel" of the login and
 * register pages. Extracted as a shared component so both auth pages stay
 * in sync without duplicating ~150 lines of CSS.
 *
 * The host is meant to live inside an already-styled `.visual-panel`
 * container (the parent owns the gradient background + sizing).
 */
@Component({
  selector: 'auth-visual',
  templateUrl: './auth-visual.component.html',
  styleUrls: ['./auth-visual.component.css'],
  imports: [MatIconModule],
})
export class AuthVisualComponent {}
