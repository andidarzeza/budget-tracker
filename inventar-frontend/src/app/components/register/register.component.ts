import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { AuthVisualComponent } from 'src/app/shared/auth-visual/auth-visual.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('400ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    AuthVisualComponent,
    LabeledFormInputComponent,
  ],
})
export class RegisterComponent {
  private readonly toasterService = inject(ToastrService);
  readonly sharedService = inject(SharedService);
  private readonly formBuilder = inject(FormBuilder);
  readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  private readonly minSpinnerMs = 500;
  private spinnerStartedAt = 0;
  private spinnerTimeout: ReturnType<typeof setTimeout> | null = null;

  showSpinner = signal(false);

  registerGroup: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  constructor() {
    // Only redirect when the stored token is still valid — `getToken()`
    // returns null for expired sessions, so an idle tab doesn't get
    // bounced into a guarded route.
    if (this.authenticationService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get username() {
    return this.registerGroup.controls['username'];
  }

  get password() {
    return this.registerGroup.controls['password'];
  }

  login(): void {
    if (!this.registerGroup.valid) {
      this.registerGroup.markAllAsTouched();
      return;
    }

    this.startSpinner();
    this.authenticationService.register(this.registerGroup.value).subscribe(
      () => this.stopSpinner(() => this.router.navigate(['/login'])),
      (error: any) => {
        this.stopSpinner(() => {
          if (error?.status === 409) {
            this.toasterService.error('Username already taken', 'Failed', TOASTER_CONFIGURATION);
          }
        });
      },
    );
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }

  private startSpinner(): void {
    if (this.spinnerTimeout) {
      clearTimeout(this.spinnerTimeout);
      this.spinnerTimeout = null;
    }
    this.spinnerStartedAt = Date.now();
    this.showSpinner.set(true);
  }

  private stopSpinner(onHidden?: () => void): void {
    const elapsed = Date.now() - this.spinnerStartedAt;
    const remaining = Math.max(0, this.minSpinnerMs - elapsed);
    this.spinnerTimeout = setTimeout(() => {
      this.showSpinner.set(false);
      this.spinnerTimeout = null;
      onHidden?.();
    }, remaining);
  }
}
