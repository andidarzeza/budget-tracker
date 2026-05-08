import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({ standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class RegisterComponent {
  private readonly toasterService = inject(ToastrService);
  readonly sharedService = inject(SharedService);
  private readonly formBuilder = inject(UntypedFormBuilder);
  readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  private readonly minSpinnerMs = 500;
  private spinnerStartedAt = 0;
  private spinnerTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }

  showSpinner = signal(false);
  
  registerGroup: UntypedFormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required]
  });
  
  get username(){
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
    this.authenticationService
      .register(this.registerGroup.value)
      .subscribe(() => this.stopSpinner(() => this.router.navigate(['/login'])),
        (error: any) => {
          this.stopSpinner(() => {
            if (error?.status === 409) {
              this.toasterService.error("Username already taken", "Failed", TOASTER_CONFIGURATION);
            }
          });
        });
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
