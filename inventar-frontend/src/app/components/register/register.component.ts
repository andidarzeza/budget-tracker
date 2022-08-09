import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { mergeMap } from 'rxjs/operators';
import { IConfiguration } from 'src/app/models/models';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';
import { TOASTER_CONFIGURATION } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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

  constructor(
    private toasterService: ToastrService, 
    public sharedService: SharedService, 
    private formBuilder: FormBuilder, 
    public authenticationService: AuthenticationService, 
    private router: Router
  ) { 
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }

  showPassword: boolean = false;
  
  registerGroup: FormGroup = this.formBuilder.group({
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
    if(this.registerGroup.valid) {
      this.authenticationService
        .register(this.registerGroup.value)
        .subscribe(() => this.router.navigate(['/login']),
      (error: any) => {
        if(error?.status === 409) {
          this.toasterService.error("Username already taken", "Failed", TOASTER_CONFIGURATION)
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
