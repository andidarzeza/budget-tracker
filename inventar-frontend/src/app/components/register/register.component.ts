import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ThemeSwitchComponent } from 'src/app/shared/theme-switch/theme-switch.component';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    ThemeSwitchComponent,
  ],
})
export class RegisterComponent {
  private readonly toasterService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  private readonly minSpinnerMs = 500;
  private spinnerStartedAt = 0;
  private spinnerTimeout: ReturnType<typeof setTimeout> | null = null;

  showSpinner = signal(false);

  registerGroup: FormGroup = this.formBuilder.group({
    // Same rules as the server (UserServiceImpl).
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S+$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
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
          } else if (error?.status === 400 || error?.status === 429) {
            this.toasterService.error(error?.error?.message ?? 'Please check the form.', 'Failed', TOASTER_CONFIGURATION);
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
