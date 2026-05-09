import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { SimplifiedAccount } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { AuthVisualComponent } from 'src/app/shared/auth-visual/auth-visual.component';
import { LabeledFormInputComponent } from 'src/app/shared/labeled-form-input/labeled-form-input.component';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
export class LoginComponent {
  private readonly toasterService = inject(ToastrService);
  private readonly configurationSevice = inject(ConfigurationService);
  readonly sharedService = inject(SharedService);
  private readonly formBuilder = inject(FormBuilder);
  readonly authenticationService = inject(AuthenticationService);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointService);

  private readonly minSpinnerMs = 500;
  private spinnerStartedAt = 0;
  private spinnerTimeout: ReturnType<typeof setTimeout> | null = null;

  showSpinner = signal(false);

  loginGroup: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    // If a session is still valid (e.g. user opens /login from the address
    // bar while already authed) skip the form and go straight to the app.
    // Don't try to redirect anywhere else from here — sending an unauthed
    // user to a guarded route bounces back through `logout()` and briefly
    // mounts the next component, which causes a fullscreen-spinner flash.
    if (this.authenticationService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    if (!this.loginGroup.valid) {
      this.loginGroup.markAllAsTouched();
      return;
    }

    this.startSpinner();
    this.authenticationService
      .login(this.loginGroup.value)
      .pipe(mergeMap(() => this.configurationSevice.getConfiguration()))
      .pipe(
        map(() => this.sharedService.changeTheme()),
        mergeMap(() => this.accountService.findAllAccountsSimplified()),
      )
      .subscribe(
        (accounts: SimplifiedAccount[]) => {
          // One profile: skip the picker and drop the user straight on the dashboard.
          // Multiple: keep the picker so they can pick which workspace to open.
          if (accounts?.length === 1) {
            const only = accounts[0];
            this.accountService
              .findOne(only.id)
              .pipe(catchError(() => of(null)))
              .subscribe(() => {
                localStorage.setItem('account', only.id);
                this.stopSpinner(() => this.router.navigate(['/dashboard']));
              });
            return;
          }
          this.stopSpinner(() => {
            this.router.navigateByUrl('/account', {
              state: { accounts },
            });
          });
        },
        (error: any) => {
          this.stopSpinner(() => {
            if (error?.status === 403) {
              this.toasterService.error('Authentication Failed', 'Failed', TOASTER_CONFIGURATION);
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
