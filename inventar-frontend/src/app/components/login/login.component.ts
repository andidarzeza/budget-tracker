import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { AccountService } from 'src/app/services/account.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
@Component({ standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
              style({ opacity: 1 }))
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
export class LoginComponent {

  constructor(
    private toasterService: ToastrService,
    private configurationSevice: ConfigurationService,
    public sharedService: SharedService,
    private formBuilder: UntypedFormBuilder,
    public authenticationService: AuthenticationService,
    private accountService: AccountService,
    private router: Router,
    public breakpointService: BreakpointService
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const account = localStorage.getItem("account");
    if (!account) {
      this.router.navigate(['/account']);
    }
    if (currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }
  showSpinner = signal(false);

  loginGroup: UntypedFormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });


  login(): void {
    if (!this.loginGroup.valid) {
      this.loginGroup.markAllAsTouched();
      return;
    }

    this.showSpinner.set(true);
    this.authenticationService
      .login(this.loginGroup.value).pipe(
        mergeMap(() => this.configurationSevice.getConfiguration())
      )
      .pipe(
        map(() => this.sharedService.changeTheme()),
        mergeMap(() => this.accountService.findAllAccountsSimplified())
      )
      .subscribe((response: any) => {
        this.showSpinner.set(false);
        this.router.navigateByUrl('/account', {
          state: {
            accounts: response
          }
        });
      },
        (error: any) => {
          this.showSpinner.set(false);
          if (error?.status === 403) {
            this.toasterService.error("Authentication Failed", "Failed", TOASTER_CONFIGURATION)
          }
        });
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
