import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { IConfiguration } from 'src/app/models/IConfiguration';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private configurationSevice: ConfigurationService, public sharedService: SharedService, private formBuilder: FormBuilder, public authenticationService: AuthenticationService, private router: Router) { 
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
      this.router.navigate(['/dashboard']);
    }
  }
  
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
        this.router.navigate(['/dashboard']);
      });
    }
  }
}
