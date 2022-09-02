import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
import { IConfiguration } from 'src/app/models/models';
import { AccountService } from 'src/app/services/account.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
    private formBuilder: FormBuilder,
    public authenticationService: AuthenticationService,
    private accountService: AccountService,
    private router: Router
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
  showSpinner = false;
  showPassword: boolean = false;

  loginGroup: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });


  login(): void {
    this.showSpinner = true;
    if (this.loginGroup.valid) {
      this.authenticationService
        .login(this.loginGroup.value).pipe(
          mergeMap(() => this.configurationSevice.getConfiguration())
        )
        .pipe(
          map(configuration => this.sharedService.changeTheme()),
          mergeMap(() => this.accountService.findAllAccountsSimplified())
        )
        .subscribe((response: any) => {
          
          console.log(response);
          
          this.showSpinner = false;
          this.router.navigateByUrl('/account', {
            state: {
              accounts: response
            }
          });
        },
          (error: any) => {
            this.showSpinner = false;
            if (error?.status === 403) {
              this.toasterService.error("Authentication Failed", "Failed", TOASTER_CONFIGURATION)
            }
          });
    }
  }

  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    if (passwordInput.type == "text") {
      passwordInput.type = "password";
    } else {
      passwordInput.type = "text";
    }
    this.showPassword = !this.showPassword;
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
