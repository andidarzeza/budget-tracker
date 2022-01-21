import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { IConfiguration } from 'src/app/models/IConfiguration';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService, TOAST_CONFIG } from 'ngx-toastr';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';
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
export class LoginComponent implements OnInit {

  constructor(private toasterService: ToastrService, private configurationSevice: ConfigurationService, public sharedService: SharedService, private formBuilder: FormBuilder, public authenticationService: AuthenticationService, private router: Router) { 
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }

  showPassword: boolean = false;
  
  loginGroup: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  
  get username(){
    return this.loginGroup.controls['username'];
  }

  get password() {
    return this.loginGroup.controls['password'];
  }

  ngOnInit(): void {
  }

  login(): void {
    if(this.loginGroup.valid) {
      this.authenticationService.login(this.username.value, this.password.value).pipe(
        mergeMap(() => this.configurationSevice.getConfiguration())
      ).subscribe((configuration: IConfiguration) => {
        this.sharedService.changeTheme(configuration.darkMode); 
        const registeredAccounts = localStorage.getItem("registeredAccounts"); 
        if(!registeredAccounts) {
          console.log("Reduce number of times to sign in?");
          
        }
        this.router.navigate(['/dashboard']);
      },
      (error: any) => {
        if(error?.status === 403) {
          this.toasterService.error("Authentication Failed", "Failed", TOASTER_CONFIGURATION)
        }
      });
    }
  }

  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    if(passwordInput.type == "text") {
      passwordInput.type = "password";
    } else {
      passwordInput.type = "text";
    }
    this.showPassword = !this.showPassword;
  }
}
